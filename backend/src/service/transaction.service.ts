// src/services/transaction.service.ts

import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateTransactionDTO, UpdateTransactionDTO, filterTransactionDTO } from "../types/transaction.types";
import { 
  createItem as createItemService,
  updateItem as updateItemService
} from "./item.service";
import { updateWalletBalance } from "./market.service";
import { syncTransactionGoal } from "./goalTransaction.service";
import { Decimal } from "@prisma/client/runtime/library";


export function currencyCheck(price: number, txCurrency: string) {
  const currencyData = {
    USD: 1,
    UAH: 44.62,
    EUR: 0.87
  }

  return price / currencyData[txCurrency as keyof typeof currencyData]
}


export function balanceChange(txType: string, balance: Decimal, price: number) {
    let balanceChange

    if(txType === "BUY"){
      balanceChange = balance.minus(new Prisma.Decimal(price))
    } else {
      balanceChange = balance.plus(new Prisma.Decimal(price))
    }

    if(Number(balanceChange) < 0) {
      throw new Error("Insufficient funds");
    }

    return balanceChange
}


export async function getAllTransactions(filter: filterTransactionDTO = {}) {
  const where: Prisma.ItemTransactionWhereInput = {}
  
  const orderBy: Prisma.ItemTransactionOrderByWithRelationInput = { acquiredAt: "desc" };

  if(filter.type) {
    where.type = filter.type
  }

  if(filter.itemStatus) {
    where.itemStatus = filter.itemStatus
  }

  const now = new Date()
  
  if(filter.tradeAble === "AVAILABLE") {
    where.tradeBanUntil = {
      lte: now
    }
  } else if(filter.tradeAble === "TRADELOCK") {
    where.tradeBanUntil = {
      gt: now
    }
  }

  if(filter.marketId) {
    where.marketId = Number(filter.marketId)
  }

  if(filter.search) {
    where.item = {
      name: {
        contains: filter.search,
        mode: "insensitive",
      }
    }
  }

  if(filter.from) {
    const start = new Date(`${filter.from}T00:00:00`);
    const end = new Date(`${filter.to ?? filter.from}T22:59:59.999`);

    where.createdAt = {
      gte: start,
      lte: end,
    }
  }

  const transactions = await prisma.itemTransaction.findMany({
    where,
    orderBy,
    include: {
      market: true,
      item: true
    }
  });

  if(transactions.length === 0) {
    throw new Error("Transactions don't exists");
  };

  return transactions
}


export async function getTransaction(id: number) {
  const transaction = await prisma.itemTransaction.findUnique({
    where: {
      id
    },
    include: {
      market: true,
      item: true
    }
  })

  if(!transaction) {
    throw new Error("Transaction doesn't exists")
  }

  return transaction
}


export async function createTransaction(data: CreateTransactionDTO) {
  return prisma.$transaction(async (tx) => {
    const newTx = data.transaction

    const market = await tx.market.findUnique({
      where: {
        id: newTx.marketId
      },
      include: {
        wallet: true
      }
    });

    if(!market) {
      throw new Error("Market not found")
    }

    if(!market.wallet) {
      throw new Error("Wallet not found")
    }

    const createData = {
      name: data.item.name,
      wear: newTx.wear
    } as const
    
    const item = await createItemService(tx, createData)
    
    const txCurrency = newTx.itemCurrency

    const price = currencyCheck(newTx.price, txCurrency)
    
    const balance = balanceChange(newTx.type, market.wallet.balance, price)
    
    const wallet = await tx.wallet.update({
      where: {
        marketId: market.id
      },
      data: {
        balance: new Prisma.Decimal(balance)
      }
    })

    let roi

    if(data.transaction.sourceBuyId) {
      const sourceTx = await tx.itemTransaction.findUnique({
        where: {
          id: data.transaction.sourceBuyId}
      })
      
      if(!sourceTx) {
        throw new Error("Source transaction not found")
      }

      const buyPrice = sourceTx.price
      const sellPrice = new Prisma.Decimal(price)
      roi = sellPrice.minus(buyPrice).div(buyPrice).mul(100);
    }

    const acquiredAt = new Date(data.transaction.acquiredAt)
    let tradeBanUntil = null
    if(data.transaction.type !== "SELL") {
      tradeBanUntil = new Date(acquiredAt)
      tradeBanUntil.setDate(tradeBanUntil.getDate() + 7)
    }

    const transaction = await tx.itemTransaction.create({
      data: {
        special: newTx.special,
        wear: newTx.wear,
        floatValue: new Prisma.Decimal(newTx.floatValue),
        price: price,
        type: newTx.type,
        quantity: newTx.quantity,
        itemStatus: newTx.itemStatus,
        itemCurrency: "USD",

        csFloatId: newTx?.csFloatId,
        steamAssetId: newTx?.steamAssetId,
        steamInstanceId: newTx?.steamInstanceId,
        steamClassId: newTx?.steamClassId,

        roi: roi ?? null,
        sourceBuyId: newTx?.sourceBuyId,
        marketId: market.id,
        itemId: item.id,
        acquiredAt,
        tradeBanUntil: tradeBanUntil
      }
    })

    await syncTransactionGoal(tx, transaction, "CREATE")

    return { market, wallet, item, transaction }
  })
}


function rollbackTransaction(
  type: string,
  balance: Decimal,
  price: Decimal
) {
  if(type === "BUY") {
    return balance.plus(price);
  }

  if(type === "SELL") {
    return balance.minus(price);
  }

  return balance;
}


function applyTransaction(
  type: string,
  balance: Decimal,
  price: Decimal
) {
  if(type === "BUY") {
    return balance.minus(price);
  }

  if(type === "SELL") {
    return balance.plus(price);
  }

  return balance;
}


export async function updateTransaction(id: number, data: UpdateTransactionDTO) {
  return prisma.$transaction(async (tx) => {
    const newTx = data.transaction
    const oldTx = await tx.itemTransaction.findUnique({
      where: {
        id: id
      }
    });
    
    if(!oldTx) {
      throw new Error("Transaction not found")
    }

    const oldMarket = await tx.market.findUnique({
      where: {
        id: oldTx.marketId
      },
      include: {
        wallet: true
      }
    })

    if(!oldMarket) {
      throw new Error("Market not found");
    };

    if(!oldMarket.wallet) {
      throw new Error("Wallet not found")
    };

    let balance = rollbackTransaction(oldTx.type, oldMarket.wallet.balance, Decimal(oldTx.price))
    await updateWalletBalance(tx, oldTx.marketId, Decimal(balance))

    const newMarket = await tx.market.findUnique({
      where: {
        id: newTx.marketId
      },
      include: {
        wallet: true
      }
    })

    if(!newMarket) {
      throw new Error("Market not found");
    };

    if(!newMarket.wallet) {
      throw new Error("Wallet not found")
    };    

    const newPrice = currencyCheck(newTx.price, newTx.itemCurrency)
    balance = applyTransaction(newTx.type, newMarket.wallet.balance, Decimal(newPrice))
    const wallet = await updateWalletBalance(tx, newTx.marketId, Decimal(balance))

    const itemId = data.item.id

    if(!itemId) {
      throw new Error("Need itemId to update")
    }

    let item = await tx.item.findUnique({
      where: {
        id: itemId
      }
    });

    if(!item) {
      throw new Error("Item not found")
    }

    const itemData = {
      name: data.item.name,
      wear: newTx.wear
    }

    if(!item) {
      item = await createItemService(tx, itemData)
    } else if(item.name !== data.item.name) {
      item = await updateItemService(tx, itemId, itemData)
    }

    const market = await tx.market.findUnique({
      where: {
        id: newTx.marketId
      },
      include: {
        wallet: true
      }
    })

    const updateTx = await tx.itemTransaction.update({
      where: {
        id: id
      },
      data: {
        special: newTx.special,
        wear: newTx.wear,
        floatValue: new Prisma.Decimal(newTx.floatValue),
        price: new Prisma.Decimal(newPrice),
        type: newTx.type,
        quantity: newTx.quantity,
        itemStatus: newTx.itemStatus,
        itemCurrency: "USD",

        csFloatId: newTx?.csFloatId,
        steamAssetId: newTx?.steamAssetId,
        steamInstanceId: newTx?.steamInstanceId,
        steamClassId: newTx?.steamClassId,

        roi: newTx?.roi,
        sourceBuyId: newTx?.sourceBuyId,
        marketId: newTx.marketId,
        itemId: item.id
      }
    })

    await syncTransactionGoal(tx, updateTx, "UPDATE")

    return { market, wallet, item, updateTx }
  })
}


export async function deleteTransaction(id: number) {
  return prisma.$transaction(async (tx) => {
    const oldTx = await tx.itemTransaction.findUnique({
      where: {
        id: id
      }
    });

    
    if(!oldTx) {
      throw new Error("Transaction not found")
    }

    if(oldTx.sourceBuyId) {
      await tx.itemTransaction.update({
        where: {
          id: oldTx.sourceBuyId
        },
        data: {
          itemStatus: "INVENTORY"
        }
      })
    }

    const oldMarket = await tx.market.findUnique({
      where: {
        id: oldTx.marketId
      },
      include: {
        wallet: true
      }
    })

    if(!oldMarket) {
      throw new Error("Market not found");
    };

    if(!oldMarket.wallet) {
      throw new Error("Wallet not found")
    };

    const balance = rollbackTransaction(oldTx.type, oldMarket.wallet.balance, Decimal(oldTx.price))
    const wallet = await updateWalletBalance(tx, oldTx.marketId, Decimal(balance))
    
    const item = await tx.item.findUnique({
      where: {
        id: oldTx.itemId
      }
    });

    if(!item) {
      throw new Error("Item not found")
    }

    const market = await tx.market.findUnique({
      where: {
        id: oldTx.marketId
      }
    })

    const deleteTx = await tx.itemTransaction.delete({
      where: {
        id: oldTx.id
      }
    })

    await syncTransactionGoal(tx, deleteTx, "DELETE")

    return { market, wallet, item, deleteTx }
  })
}


export async function getAllNotSoldTx() {
  return await prisma.itemTransaction.findMany({
    where: {
      type: "BUY",
      NOT: [{
        OR: [
          {itemStatus: "LISTING"},
          {itemStatus: "SOLD"}
        ]
      }] 
    },
    include: {
      market: true,
      item: true
    }
  })
}


export async function getAllTransactionRoad(id: number) {
  const sourceTx = await prisma.itemTransaction.findUnique({
    where: {
      id: id
    },
    include: {
      item: true,
      market: true
    }
  })

  if(!sourceTx) {
    throw new Error("Source transaction not found")
  }

  if(sourceTx.type === "SELL") {
    
    if(!sourceTx.sourceBuyId) {
      throw new Error("Transaction doesn't have source")
    }

    const buyTx = await prisma.itemTransaction.findUnique({
      where: {
        id: sourceTx.sourceBuyId
      },
      include: {
        item: true,
        market: true
      }
    })

    const childrenTx = await prisma.itemTransaction.findMany({
      where: {
        sourceBuyId: buyTx?.id
      },
      include: {
        item: true,
        market: true
      }
    })

    return { sourceTx: [buyTx], childrenTx };
  }

  const childrenTx = await prisma.itemTransaction.findMany({
    where: {
      sourceBuyId: id
    },
    include: {
      item: true,
      market: true
    }
  })

  return {sourceTx: [sourceTx], childrenTx}
}


export async function updateTxStatus(id: number, quantity: number) {
  const tx = await prisma.itemTransaction.findUnique({
    where: {
      id
    }
  })
  if(!tx) {
    throw new Error("Transaction doesn't exist")
  }

  if(tx.quantity !== quantity) {
    return await prisma.itemTransaction.update({
      where: {
        id
      },
      data: {
        itemStatus: "LISTING"
      }
    })
  }

  return await prisma.itemTransaction.update({
    where: {
      id
    },
    data: {
      itemStatus: "SOLD"
    }
  })
}
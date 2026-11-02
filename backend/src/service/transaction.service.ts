// src/services/transaction.service.ts

import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateTransactionDTO, UpdateTransactionDTO, filterTransactionDTO } from "../types/transaction.types";
import { 
  createItem as createItemService,
  updateItem as updateItemService
} from "./item.service";
import { updateWalletBalance } from "./wallet.service";
import { syncTransactionGoal } from "./goalTransaction.service";
import { currencyCheck } from "../utils/mainUtils";
import { Decimal } from "@prisma/client/runtime/library";


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


export async function getAllTransactions(userId: number, filter: filterTransactionDTO = {}) {
  const where: Prisma.ItemTransactionWhereInput = {userId,}
  
  const orderBy: Prisma.ItemTransactionOrderByWithRelationInput = { acquiredAt: "desc" };

  if(filter.type) {
    where.type = filter.type
  }

  if(filter.itemStatus) {
    where.itemStatus = filter.itemStatus
  }

  const now = new Date()
  const nextDay = new Date(now)
  nextDay.setDate(nextDay.getDate()+1)

  switch (filter.tradeAble) {
    case "AVAILABLE":
      where.tradeBanUntil = {
        lte: now
      }
      break

    case "TRADELOCK":
      where.tradeBanUntil = {
        gt: now
      }
      break
    
    case "POSSIBLE": 
      where.tradeBanUntil = {
        gt: now,
        lte: nextDay
      }
      break
  }


  if(filter.walletId) {
    where.walletId = Number(filter.walletId)
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
      wallet: {
        include: {
          market: true
        }
      },
      item: true
    }
  });

  if(transactions.length === 0) {
    throw new Error("Transactions don't exists");
  };

  return transactions
}


export async function getTransaction(userId: number, id: number) {
  const transaction = await prisma.itemTransaction.findUnique({
    where: {
      id,
      userId
    },
    include: {
      wallet: {
        include: {
          market: true
        }
      },
      item: true
    }
  })

  if(!transaction) {
    throw new Error("Transaction doesn't exists")
  }

  return transaction
}


export async function createTransaction(userId: number, data: CreateTransactionDTO) {
  console.log(data)
  return prisma.$transaction(async (tx) => {
    const newTx = data.transaction

    const wallet = await tx.wallet.findUnique({
      where: {
        id: newTx.walletId,
        userId
      },
      include: {
        market: true
      }
    });

    if(!wallet) {
      throw new Error("Wallet not found")
    };

    const item = await createItemService(tx, data.item.name)

    const price = currencyCheck(new Prisma.Decimal(newTx.price), newTx.itemCurrency )
    
    updateWalletBalance(tx, newTx.walletId, userId, price, false)

    let roi

    if(data.transaction.sourceBuyId) {
      const sourceTx = await tx.itemTransaction.findUnique({
        where: {
          id: data.transaction.sourceBuyId,
          userId
        }
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
        floatValue: new Prisma.Decimal(newTx.floatValue),
        price: price,
        type: newTx.type,
        quantity: newTx.quantity,
        itemStatus: newTx.itemStatus,
        itemCurrency: "USD",

        csFloatId: newTx?.csFloatId,
        steamAssetId: newTx?.steamAssetId,
        steamInstanceId: newTx?.steamInstanceId,

        roi: roi ?? null,
        sourceBuyId: newTx?.sourceBuyId,
        walletId: newTx.walletId,
        itemId: item.id,
        userId,
        acquiredAt,
        tradeBanUntil: tradeBanUntil
      }
    })

    await syncTransactionGoal(tx, transaction, "CREATE")

    return { wallet, item, transaction }
  })
}

export async function updateTransaction(userId: number, id: number, data: UpdateTransactionDTO) {
  return prisma.$transaction(async (tx) => {
    const newTx = data.transaction
    const oldTx = await tx.itemTransaction.findUnique({
      where: {
        id: id,
        userId
      }
    });
    
    if(!oldTx) {
      throw new Error("Transaction not found")
    }

    const oldWallet = await tx.wallet.findUnique({
      where: {
        id: oldTx.walletId
      },
      include: {
        market: true
      }
    })

    if(!oldWallet) {
      throw new Error("Wallet not found");
    };

    await updateWalletBalance(tx, oldTx.walletId, userId, Decimal(oldTx.price), true)

    const newWallet = await tx.wallet.findUnique({
      where: {
        id: newTx.walletId
      },
      include: {
        market: true
      }
    })

    if(!newWallet) {
      throw new Error("Wallet not found");
    };

    const newPrice = currencyCheck(new Prisma.Decimal(newTx.price), newTx.itemCurrency)
    const wallet = await updateWalletBalance(tx, newTx.walletId, userId, Decimal(newPrice), false)

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

    if(!item) {
      item = await createItemService(tx, data.item.name)
    } else if(item.name !== data.item.name) {
      item = await updateItemService(tx, itemId, data.item.name)
    }

    const updateTx = await tx.itemTransaction.update({
      where: {
        id: id
      },
      data: {
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
        walletId: newTx.walletId,
        itemId: item.id
      }
    })

    await syncTransactionGoal(tx, updateTx, "UPDATE")

    return { wallet, item, updateTx }
  })
}


export async function deleteTransaction(userId: number, id: number,) {
  return prisma.$transaction(async (tx) => {
    const oldTx = await tx.itemTransaction.findUnique({
      where: {
        id,
        userId
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

    const oldWallet = await tx.wallet.findUnique({
      where: {
        id: oldTx.walletId
      },
      include: {
        market: true
      }
    })

    if(!oldWallet) {
      throw new Error("Wallet not found");
    };

    const wallet = await updateWalletBalance(tx, oldTx.walletId, userId, Decimal(oldTx.price), true)
    
    const item = await tx.item.findUnique({
      where: {
        id: oldTx.itemId
      }
    });

    if(!item) {
      throw new Error("Item not found")
    }

    const deleteTx = await tx.itemTransaction.delete({
      where: {
        id: oldTx.id
      }
    })

    await syncTransactionGoal(tx, deleteTx, "DELETE")

    return { wallet, item, deleteTx }
  })
}


export async function getAllNotSoldTx(userId: number) {
  const txs = await prisma.itemTransaction.findMany({
    where: {
      userId,
      type: "BUY",
      NOT: [{
        OR: [
          {itemStatus: "LISTING"},
          {itemStatus: "SOLD"}
        ]
      }] 
    },
    include: {
      item: true,
      wallet: {
        include: {
          market: true
        }
      }
    }
  })

  let allInvest = txs.reduce((acum, tx) => 
    new Prisma.Decimal(acum).plus(tx.price), new Prisma.Decimal(0))
  return { txs, allInvest }
}


export async function getAllTransactionRoad(userId: number, id: number) {
  const sourceTx = await prisma.itemTransaction.findUnique({
    where: {
      id,
      userId
    },
    include: {
      item: true,
      wallet: {
        include: {
          market: true
        }
      }
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
        id: sourceTx.sourceBuyId,
        userId
      },
      include: {
        item: true,
        wallet: {
          include: {
            market: true
          }
        }
      }
    })

    const childrenTx = await prisma.itemTransaction.findMany({
      where: {
        sourceBuyId: buyTx?.id,
        userId
      },
      include: {
        item: true,
        wallet: {
          include: {
            market: true
          }
        }
      }
    })

    return { sourceTx: [buyTx], childrenTx };
  }

  const childrenTx = await prisma.itemTransaction.findMany({
    where: {
      sourceBuyId: id,
      userId
    },
    include: {
      item: true,
      wallet: {
        include: {
          market: true
        }
      }
    }
  })

  return {sourceTx, childrenTx}
}


export async function updateTxStatus(userId: number, id: number, quantity: number) {
  const tx = await prisma.itemTransaction.findUnique({
    where: {
      id,
      userId
    }
  })
  if(!tx) {
    throw new Error("Transaction doesn't exist")
  }

  if(tx.quantity !== quantity) {
    return await prisma.itemTransaction.update({
      where: {
        id,
        userId
      },
      data: {
        itemStatus: "LISTING"
      }
    })
  }

  return await prisma.itemTransaction.update({
    where: {
      id,
      userId
    },
    data: {
      itemStatus: "SOLD"
    }
  })
}
// src/services/transaction.service.ts

import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateTransactionDTO, UpdateTransactionDTO } from "../types/transaction.types";
import { 
  createItem as createItemService,
  updateItem as updateItemService
} from "./item.service";
import { updateWalletBalance, getMarket } from "./market.service";
import { Decimal } from "@prisma/client/runtime/library";


export function currencyCheck(money: number, txCurrency: string) {
  const currencyData = {
    USD: 1,
    UAH: 44.62,
    EUR: 0.87
  }

  if(txCurrency === "UAH") {
    money = money / currencyData.UAH
  } else if(txCurrency === "EUR") {
    money = money / currencyData.EUR
  }

  return money
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

export async function getAllTransactions() {
  const transactions = await prisma.itemTransaction.findMany({
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
    const market = await tx.market.findUnique({
      where: {
        id: data.transaction.marketId
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
    
    const item = await createItemService(tx, data.item)
    
    const txCurrency = data.transaction.itemCurrency
    const price = currencyCheck(data.transaction.price, txCurrency)

    let balance = balanceChange(data.transaction.type, market.wallet.balance, price)
    
    const wallet = await tx.wallet.update({
      where: {
        marketId: market.id
      },
      data: {
        balance: new Prisma.Decimal(balance)
      }
    })

    const transaction = await tx.itemTransaction.create({
      data: {
        special: data.transaction.special,
        wear: data.transaction.wear,
        floatValue: new Prisma.Decimal(data.transaction.floatValue),
        price: price,
        type: data.transaction.type,
        quantity: data.transaction.quantity,
        itemStatus: data.transaction.itemStatus,
        itemCurrency: "USD",

        csFloatId: data.transaction?.csFloatId,
        steamAssetId: data.transaction?.steamAssetId,
        steamInstanceId: data.transaction?.steamInstanceId,
        steamClassId: data.transaction?.steamClassId,

        marketId: market.id,
        itemId: item.id
      }
    })

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


    const itemId = newTx.itemId

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

    console.log(item)

    if(!item) {
      item = await tx.item.create({
        data: {
          name: data.item.name
        }
      })
    } else if(item.name !== data.item.name) {
      item = await tx.item.update({
        where: {
          id: itemId
        },
        data: {
          name: data.item.name
        }
      })
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

        marketId: newTx.marketId,
        itemId: item.id
      }
    })

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

    const deleteGoalTxs = await tx.goalTransaction.deleteMany({
      where: {
        transactionId: oldTx?.id
      }
    })

    const deleteTx = await tx.itemTransaction.delete({
      where: {
        id: oldTx.id
      }
    })

    return { market, wallet, item, deleteTx, deleteGoalTxs }
  })
}
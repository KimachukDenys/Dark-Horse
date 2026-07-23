// src/service/market.service.ts

import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../lib/prisma"
import { Prisma, Currency, MarketName } from "@prisma/client"

export async function getAllMarkets() {
  const markets = await prisma.market.findMany({
    include: {
      wallet: true
    }
  });

  if(markets.length === 0) {
    throw new Error("Markets don't exists");
  }

  return markets
}

export async function getMarket(id: number) {
  return await prisma.$transaction(async (tx) => {
    
    const market = await tx.market.findUnique({
      where: {
        id
      },
      include: {
        wallet: true
      }
    });
    
    if(!market) {
      throw new Error("Market doesn't exists");
    }

    if(!market.wallet) {
      throw new Error("Market doesn't exists");
    }


    return market
  })
}

export async function createMarket(data: {market: {name: MarketName}, wallet: {balance: number, currency: Currency}}) {
  const market = await prisma.market.findUnique({
    where: {
      name: data.market.name,
    },
  });

  if (market) {
    throw new Error("Market already exists");
  }

  return await prisma.$transaction(async (tx) => {
    const newMarket = await tx.market.create({
      data: {
        name: data.market.name
      }
    })

    const wallet = await tx.wallet.create({
      data: {
        balance: new Prisma.Decimal(data.wallet.balance),
        currency: data.wallet.currency,

        marketId: newMarket.id
      }
    })

    return {newMarket, wallet}
  })
}

export async function deleteMarket(id: number) {
  await prisma.$transaction(async (tx) => {
    const market = await tx.market.findUnique({
      where: {
        id
      }
    });

    if(!market) {
      throw new Error("Market doesn't exists")
    }

    await tx.wallet.delete({
      where: {
        marketId: market.id
      }
    });

    await tx.market.delete({
      where: {
        id
      }
    });
  });
}


export async function updateWalletBalance(tx: Prisma.TransactionClient, marketId: number, newBalance: Decimal) {
  return await tx.wallet.update({
    where: {
      marketId: marketId
    },
    data: {
      balance: new Prisma.Decimal(newBalance)
    }
  })
}
// src/service/market.service.ts
import prisma from "../lib/prisma"

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

export async function getAvailableMarkets(userId: number) {
  return prisma.market.findMany({
    where: {
      wallet: {
        none: {
          userId
        }
      }
    }
  })
}

export async function createMarket(data: {name: string, hashName: string}) {
  const market = await prisma.market.findUnique({
    where: {
      name: data.name,
    },
  });

  if (market) {
    throw new Error("Market already exists");
  }

  const newMarket = await prisma.market.create({
    data: {
      name: data.name,
      hashName: data.hashName
    }
  })

  return newMarket
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

    await tx.wallet.deleteMany({
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

export async function updateMarket(id: number, data: {name: string, hashName: string}) {
  if(!id || !data) {
    throw new Error("Not enough data to update Market")
  }
  return prisma.$transaction(async (tx) => {
    const market = tx.market.findUnique({
      where: {
        id
      }
    })

    if(!market) {
      throw new Error("Market doesn't exist")
    }

    await tx.market.update({
      where: {
        id
      },
      data: {
        name: data.name,
        hashName: data.hashName
      }
    })
  })
} 
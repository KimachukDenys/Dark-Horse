import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export async function getDashboard(userId: number,from?: Date, to?: Date) {

  const [overall, byWallet, byFlow, month] = await Promise.all([
    getOverallStats(userId, from, to),
    getMarketStats(userId,from, to),
    getMarketFlow(userId, from, to),
    getMonthlyStatistics(userId)
  ])

  
  return {
    overall,
    wallets: byWallet,
    flow: byFlow,
    months: month
  }
}

async function getOverallStats(userId: number, from?: Date, to?: Date) {
  const purchased = await prisma.itemTransaction.aggregate({
    where: {
      userId,
      type: "BUY",
      NOT: [
        {itemStatus: "PENDING"},
        {itemStatus: "INVENTORY"}
      ],
      ...(from || to ? {
        createdAt: {
          ...(from && {gte: from}),
          ...(to && {lte: to}),
        }
      } : {})
    },
    _sum: {
      price: true
    },
    _avg: {
      price: true
    },
    _count: true
  })



  const sales = await prisma.itemTransaction.aggregate({
    where: {
      type: "SELL",
      ...(from || to ? {
        createdAt: {
          ...(from && {gte: from}),
          ...(to && {lte: to}),
        }
      } : {})
    },
    _sum: {
      price: true
    },
    _avg: {
      price: true
    },
    _count: true
  })

  const openCapital = await prisma.itemTransaction.aggregate({
    where: {
      type: "BUY",
      NOT: [
        {itemStatus: "LISTING"},
        {itemStatus: "SOLD"}
      ]
    },
    _sum: {
      price: true
    },
    _count: true
  })

  const overall = {
    purchased: purchased._sum.price || new Prisma.Decimal(0),
    purchasedAvg: purchased._avg.price || new Prisma.Decimal(0),
    purchasedCount: purchased._count || 0,
    openCapital: openCapital._sum.price,
    openCapitalCount: openCapital._count,
    sales: sales._sum.price || new Prisma.Decimal(0),
    salesAvg: sales._avg.price || new Prisma.Decimal(0),
    salesCount: sales._count || 0,
    profit: new Prisma.Decimal(0),
    roi: new Prisma.Decimal(0)
  }

  overall.profit = overall.sales.minus(overall.purchased)
  overall.roi = overall.profit.div(overall.purchased).mul(100)

  return overall
}



async function getMarketStats(userId: number, from?: Date, to?: Date) {
  const purchased = await prisma.itemTransaction.groupBy({
    by: ["walletId"],
    where: {
      userId,
      type: "BUY",
      NOT: [
        {itemStatus: "PENDING"},
        {itemStatus: "INVENTORY"}
      ],
      ...(from || to ? {
        createdAt: {
          ...(from && {gte: from}),
          ...(to && {lte: to}),
        }
      } : {})
    },
    orderBy: {
      walletId: "asc"
    },
    _sum: {
      price: true
    },
    _avg: {
      price: true
    },
    _count: true
  })

  const sales = await prisma.itemTransaction.groupBy({
    by: ["walletId"],
    where: {
      type: "SELL",
      ...(from || to ? {
        createdAt: {
          ...(from && {gte: from}),
          ...(to && {lte: to}),
        }
      } : {})
    },
    orderBy: {
      walletId: "asc"
    },
    _sum: {
      price: true
    },
    _avg: {
      price: true
    },
    _count: true
  })

  const openCapital = await prisma.itemTransaction.groupBy({
    by: ["walletId"],
    where: {
      type: "BUY",
      NOT: [
        {itemStatus: "LISTING"},
        {itemStatus: "SOLD"}
      ]
    },
    _sum: {
      price: true
    },
    _count: true
  })

  const wallets = await prisma.wallet.findMany({
    include: {
      market: true
    }
  })

  if(!wallets) {
    return
  }

  const salesMap = new Map(
    sales.map(item => [item.walletId, item])
  )

  const openCapitalMap = new Map(
    openCapital.map(item => [item.walletId, item])
  )

  const walletMap = new Map(
    wallets.map(item => [item.id, item])
  )

  const markets = purchased.map(item => {
    const openCapitalMarket = openCapitalMap.get(item.walletId)
    const salesMarket = salesMap.get(item.walletId)
    const wallet = walletMap.get(item.walletId)

    const purchasedPrice = item._sum.price ?? new Prisma.Decimal(0)
    const purchasedAvg = item._avg.price ?? new Prisma.Decimal(0)
    const openCapitalPrice = openCapitalMarket?._sum.price ?? new Prisma.Decimal(0)
    const salesPrice = salesMarket?._sum.price ?? new Prisma.Decimal(0)
    const salesAvg = salesMarket?._avg.price ?? new Prisma.Decimal(0)
    const balance = wallet?.balance ?? new Prisma.Decimal(0)
    const marketName = wallet?.market.name ?? null

    const netFlow = salesPrice.minus(purchasedPrice)

    const roi = purchasedPrice.equals(0)
      ? new Prisma.Decimal(0)
      : netFlow.div(purchasedPrice).mul(100)

    return {
      walletId: item.walletId,
      purchased: purchasedPrice,
      purchasedAvg: purchasedAvg,
      purchasedCount: item._count || 0,
      openCapital: openCapitalPrice,
      openCapitalCount: openCapitalMarket?._count || 0,
      sales: salesPrice,
      salesAvg: salesAvg,
      salesCount: salesMarket?._count || 0,
      balance,
      marketName,
      netFlow,
      roi
    }
  })

  return markets
}



async function getMarketFlow(userId: number, from?: Date, to?: Date) {
  const flow = await prisma.itemTransaction.findMany({
    where: {
      userId,
      type: "SELL",
      ...(from || to ? {
        createdAt: {
          ...(from && {gte: from}),
          ...(to && {lte: to}),
        }
      } : {}),
      NOT: {
        sourceBuy: null
      }
    },
    include: {
      item: true,
      wallet: {
        include: {
          market: true
        }
      },
      sourceBuy: {
        include: {
          wallet: {
            include: {
              market: true
            }
          }
        }
      }
    }
  })

  const flowMarkets: {[k: string]: any} = {}

  flow.forEach(transaction => {
    if(!transaction.sourceBuy) {
      return
    }
    const sourceBuy = transaction.sourceBuy
    

    const sourceMarket = sourceBuy.wallet.market.name
    const sellMarket = transaction.wallet.market.name

    if(!flowMarkets[sourceMarket]) {
      flowMarkets[sourceMarket] = {
        count: 0,
        purchased: new Prisma.Decimal(0),
        markets: {}
      }
    }

    if(!flowMarkets[sourceMarket].markets[sellMarket]) {
      flowMarkets[sourceMarket].markets[sellMarket] = {
        count: 0,
        sales: new Prisma.Decimal(0)
      }
    }

    flowMarkets[sourceMarket].count += 1
    flowMarkets[sourceMarket].purchased = 
      flowMarkets[sourceMarket].purchased.plus(sourceBuy.price) 

    flowMarkets[sourceMarket].markets[sellMarket].count += 1
    flowMarkets[sourceMarket].markets[sellMarket].sales = 
      flowMarkets[sourceMarket].markets[sellMarket].sales.plus(transaction.price) 
  }) 

  return flowMarkets
}



async function getMonthlyStatistics(userId: number) {
  const bought = await prisma.itemTransaction.groupBy({
    by: ["createdAt"],
    where: {
      userId,
      type: "BUY",
      OR: [
        {itemStatus: "SOLD"},
        {itemStatus: "LISTING"}
      ]
    },
    orderBy: {
      createdAt: "asc"
    },
    _sum: {
      price: true
    }
  })

  const sold = await prisma.itemTransaction.groupBy({
    by: ["createdAt"],
    where: {
      type: "SELL",
      NOT: {
        sourceBuyId: null
      }
    },
    orderBy: {
      createdAt: "asc"
    },
    _sum: {
      price: true
    }
  })

  const monthly: {[k: string]: {amount: Prisma.Decimal}} = {}
  
  for (const item of sold) {
    const date = `${item.createdAt.toISOString().slice(0, 7)}-01`

    if (!monthly[date]) {
        monthly[date] = {
            amount: new Prisma.Decimal(0)
        }
    }

    monthly[date].amount = monthly[date].amount.plus(
        item._sum.price ?? new Prisma.Decimal(0)
    )
  }

  for (const item of bought) {
    const date = `${item.createdAt.toISOString().slice(0, 7)}-01`

    if (!monthly[date]) {
        monthly[date] = {
            amount: new Prisma.Decimal(0)
        }
    }

    monthly[date].amount = monthly[date].amount.minus(
        item._sum.price ?? new Prisma.Decimal(0)
    )
  }

  return monthly
}
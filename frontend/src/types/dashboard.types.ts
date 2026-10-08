export type DashOverall = {
  openCapital: string,
  openCapitalCount: number,
  profit: string,
  purchased: string,
  purchasedAvg: string,
  purchasedCount: number,
  sales: string,
  salesAvg: string,
  salesCount: number,
  roi: string,
} 

export type FlowMarkets = {
  count: number,
  sales: string
}

export type DashFlow = {
  count: number,
  purchased: string,
  markets: FlowMarkets[]
}

export type DashMarket = {
  marketId: number,
  marketName: string,
  balance: string,
  netFlow: string,
  openCapital: string,
  openCapitalCount: number,
  purchased: string,
  purchasedAvg: string,
  purchasedCount: number,
  sales: string,
  salesAvg: string,
  salesCount: number,
}

export type DashMonth = {
  amount: string
}

export type Dashboard = {
  overall: DashOverall,
  months: DashMonth[],
  flow: Record<string, DashFlow>,
  markets: DashMarket[]
}


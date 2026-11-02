import type { TransactionType } from "./transaction.types"
import type { MarketType } from "./market.types"


export type GoalTransactionType = {
    id: number,
    goalId: number,
    transactionId: number,
    transaction: TransactionType
}

export type Goal = {
  id: number,
  userId: number,

  sourceWalletId: number,
  targetWalletId: number,
  status: string,

  name: string,
  description?: string,
  targetInvestment: number,
  targetReceive: number,
  targetSpend?: number,
  targetReturn?: number,
  roi?: number,

  createdAt: string,
  updatedAt: string,
  closedAt?: string,

  sourceWallet: {
    id: number,
    market: MarketType
  },

  targetWallet: {
    id: number,
    market: MarketType
  },

  goalTransactions: GoalTransactionType[]
}

export type GoalsType = {
  goal: Goal,
  stats: {
    spent: number,
    returned: number,
    roi: number
  }
}

export type GoalType = {
  goal: Goal,
  stats: {
    spent: number,
    returned: number,
    progres: number,
    remaining: number,
    profit: number,
    roi: number
  }
}

export const GoalStatusAndColor: Record<string, {name: string, color: string}> = {
  "QUEUED": {name: "Queued", color: "var(--warning)"},
  "ACTIVE": {name: "Active", color: "var(--accent-border)"},
  "COMPLETED": {name: "Completed", color: "var(--complete)"},
  "CANCELED": {name: "Canceled", color: "var(--accent-red)"}
}

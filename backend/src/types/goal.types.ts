import { CurrencyName, GoalStatus } from "@prisma/client";

export type createGoalData = {
  sourceWalletId: number;
  targetWalletId: number;
  status: GoalStatus;

  name: string;
  description?: string;
  targetInvestment: number;
  targetReceive: number;
  targetSpend: number;
  targetReturn: number;
  investCurrency: CurrencyName;
  receiveCurrency: CurrencyName; 
}

export type updateGoalData = {
  update: {
    closedAt?: string
  },
  goal: createGoalData;
}
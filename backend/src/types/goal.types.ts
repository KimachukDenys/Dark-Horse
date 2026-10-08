import { GoalStatus } from "@prisma/client";

export type createGoalData = {
  sourceMarketId: number;
  targetMarketId: number;
  status: GoalStatus;

  name: string;
  description?: string;
  targetInvestment: number;
  targetReceive: number;
  targetSpend: number;
  targetReturn: number;
}

export type updateGoalData = {
  update: {
    closedAt?: string
  },
  goal: createGoalData;
}
export type createGoalData = {
  name: string;
  description?: string;
  targetInvestment: number;
  targetReturn: number;
}

export type updateGoalData = {
  update: {
    id: number,
    closedAt: Date
  },
  goal: createGoalData;
}
// src/goal/goal.service.ts

import { Prisma } from "@prisma/client"
import prisma from "../lib/prisma"
import { createGoalData, updateGoalData } from "../types/goal.types"


export async function getAllGoals() {
  const goals =  await prisma.goal.findMany({
    include: {
      goalTransactions: {
        include: {
          transactions: true
        }
      }
    }
  })

  if(goals.length === 0) {
    throw new Error("Goals don't exists")
  }

  return goals
}


export async function getGoal(id: number) {
  const goal = await prisma.goal.findUnique({
    where: {
      id
    },
    include: {
      goalTransactions: {
        include: {
          transactions: true
        }
      }
    }
  })

  if(!goal) {
    throw new Error("Goal not found")
  }

  return goal
}


export async function createGoal(data: createGoalData) {
  return await prisma.goal.create({
    data: {
      name: data.name,
      description: data?.description,
      targetInvestment: new Prisma.Decimal(data.targetInvestment),
      targetReturn: new Prisma.Decimal(data.targetReturn),
    }
  })
}


export async function updateGoal(data: updateGoalData) {
  const goal = await prisma.goal.findUnique({
    where: {
      id: data.update.id
    }
  })

  if(goal) {
    throw new Error("Goal not found")
  }

  return await prisma.goal.update({
    where: {
      id: data.update.id
    },
    data: {
      name: data.goal.name,
      description: data.goal?.description,
      targetInvestment: new Prisma.Decimal(data.goal.targetInvestment),
      targetReturn: new Prisma.Decimal(data.goal.targetReturn),
      closedAt: data.update?.closedAt
    }
  })
}

export async function deleteGoal(id: number) {
  return await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findUnique({
      where: {
        id
      }
    })

    if(!goal) {
      throw new Error("Goal not found")
    }
    
    const deleteGoatTxs = await tx.goalTransaction.deleteMany({
      where: {
        goalId: id
      }
    })

    const deleteGoal = await tx.goal.delete({
      where: {
        id
      }
    })

    return {deleteGoal, deleteGoatTxs}
  })
}









// GoalTransaction methods


export async function createGoalTx(data: {goalId: number, transactionId: number}) {
  return await prisma.goalTransaction.create({
    data: {
      goalId: data.goalId,
      transactionId: data.transactionId
    }
  })
}


export async function updateGoalTx(data: {id: number, goalId: number, transactionId: number}) {
  return await prisma.goalTransaction.update({
    where: {
      id: data.id
    },
    data: {
      goalId: data?.goalId,
      transactionId: data?.transactionId,
    }
  })
}


export async function deleteGoalTx(id: number) {
  return await prisma.goalTransaction.delete({
    where: {
      id
    }
  })
}
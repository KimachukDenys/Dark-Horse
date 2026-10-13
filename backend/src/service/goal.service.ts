// src/goal/goal.service.ts

import { Prisma, GoalStatus } from "@prisma/client"
import prisma from "../lib/prisma"
import { createGoalData, updateGoalData } from "../types/goal.types"
import { it } from "node:test"


export async function getAllGoals() {
  const goals =  await prisma.goal.findMany({
    orderBy: {
      id: "asc"
    },
    include: {
      goalTransactions: {
        include: {
          transaction: true
        }
      },
      sourceMarket: true,
      targetMarket: true
    }
  })

  if(goals.length === 0) {
    throw new Error("Goals don't exists")
  }

  const goalsMap = goals.map(goal => {
    const transaction = goal.goalTransactions.map(item => item.transaction)

    const spent = transaction.reduce((accum, item) => {
      if(item.type === "BUY") {
        return accum.plus(item.price)
      }
      return accum
    }, new Prisma.Decimal(0))

    const returned = transaction.reduce((accum, item) => {
      if(item.type === "SELL") {
        return accum.plus(item.price)
      }
      return accum
    }, new Prisma.Decimal(0))

    const roi = returned.minus(goal.targetInvestment).div(goal.targetInvestment).mul(100)

    return {
      goal,
      stats: {
        spent,
        returned,
        roi
      }
    }
  })

  return goalsMap
}


export async function getGoal(id: number) {
  const goal = await prisma.goal.findUnique({
    where: {
      id
    },
    include: {
      goalTransactions: {
        include: {
          transaction: {
            include: {
              item: true,
              market: true
            }
          }
        }
      },
      sourceMarket: true,
      targetMarket: true
    }
  })

  if(!goal) {
    throw new Error("Goal not found")
  }

  const transaction = goal.goalTransactions.map(item => item.transaction)

  const spent = transaction.reduce((accum, item) => {
    if(item.type === "BUY") {
        return accum.plus(item.price)
    }
    return accum
  }, new Prisma.Decimal(0))
  
  const returned = transaction.reduce((accum, item) => {
    if(item.type === "SELL") {
      return accum.plus(item.price)
    }
    return accum
  }, new Prisma.Decimal(0))

  const remaining = goal.targetReceive.minus(spent)
  const progres = goal.targetReceive.equals(0) ? new Prisma.Decimal(0) : spent.div(goal.targetReceive).mul(100)
  
  const profit = returned.minus(goal.targetInvestment)
  const roi = returned.minus(goal.targetInvestment).div(goal.targetInvestment).mul(100)

  return {
    goal,
    stats: {
      spent,
      returned,
      progres,
      remaining,
      profit,
      roi
    }
  }
}


export async function createGoal(data: createGoalData) {
  return await prisma.$transaction(async (tx) => {
    let status = "QUEUED" as GoalStatus
    
    if(!data) {
      throw new Error("data doesn't")
    }
    const activeGoal = await tx.goal.findFirst({
      where: {
        sourceMarketId: data.sourceMarketId,
        status: "ACTIVE"
      }
    })
    
    if(!activeGoal) {
      status = "ACTIVE"
    }



    return await tx.goal.create({
      data: {
        sourceMarketId: data.sourceMarketId,
        targetMarketId: data.targetMarketId,
        status: status,
        
        name: data.name,
        description: data?.description,
        targetInvestment: new Prisma.Decimal(data.targetInvestment),
        targetReceive: new Prisma.Decimal(data.targetReceive),
      }
    })
  })
}


export async function updateGoal(id: number, data: updateGoalData) {
  return await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findUnique({
      where: {
        id
      }
    })

    if(!goal) {
      throw new Error("Goal not found")
    }
    
    return await tx.goal.update({
      where: {
        id
      },
      data: {
        sourceMarketId: data.goal.sourceMarketId,
        targetMarketId: data.goal.targetMarketId,
        status: data.goal?.status,
        
        name: data.goal.name,
        description: data.goal?.description,
        targetInvestment: new Prisma.Decimal(data.goal.targetInvestment),
        targetReceive: new Prisma.Decimal(data.goal.targetReceive),
      }
    })
  })
}

export async function activateGoal(id: number) {
  return await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findUnique({
      where: {
        id
      }
    })

    if(!goal) {
      throw new Error("Goal doesn't exist")
    }

    if(goal.status !== "QUEUED") {
      return new Error("This goal can't be active")
    }

    const oldActive = await tx.goal.findFirst({
      where: {
        status: "ACTIVE",
        sourceMarketId: goal.sourceMarketId,
        targetMarketId: goal.targetMarketId 
      }
    })

    if(oldActive) {
      await tx.goal.update({
        where: {
          id: oldActive.id
        }, 
        data: {
          status: "QUEUED"
        }
      })
    }

    return await tx.goal.update({
      where: {
        id
      }, 
      data: {
        status: "ACTIVE"
      }
    })
  })
}


export async function completeGoal(id: number, data: updateGoalData) {
  return await prisma.$transaction(async (tx) => {
    const goalData = data.goal
    const goal = await tx.goal.findUnique({
      where: {
        id
      }
    })

    if(!goal) {
      throw new Error("Goal doesn't exist")
    }

    if(goalData.targetReceive > goalData.targetSpend) {
      throw new Error("Goal doesn't complete")
    }

    // calculation of goal deviation 
    const deviation = getAmountDeviation(Number(goal.targetReceive))
    const spent = goalData.targetSpend


    if(deviation.rMin > spent || spent > deviation.rMax) {
      throw new Error(`The amount spent exceeds the funds received, and there may be a discrepancy in ${deviation.dev.toFixed(2)}$`)
    }

    return await tx.goal.update({
      where: {
        id
      },
      data: {
        status: "COMPLETED",
        targetSpend: goalData.targetSpend,
        targetReturn: goalData.targetReturn,
        closedAt: data.update.closedAt ? new Date(data.update.closedAt) : undefined
      }
    })
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

    const deleteGoal = await tx.goal.delete({
      where: {
        id
      }
    })

    return deleteGoal
  })
}


function getAmountDeviation(received: number) {
  const k = 0.5
  const deviation = k * Math.sqrt(received)
  const receivedMax = received + deviation
  const receivedMin = received + deviation

  return {dev: deviation, rMax: receivedMax, rMin: receivedMin}
}
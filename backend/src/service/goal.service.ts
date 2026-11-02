// src/goal/goal.service.ts

import { Prisma, GoalStatus } from "@prisma/client"
import prisma from "../lib/prisma"
import { createGoalData, updateGoalData } from "../types/goal.types"
import { currencyCheck } from "../utils/mainUtils"


export async function getAllGoals(userId: number) {
  const goals =  await prisma.goal.findMany({
    where: {
      userId
    },
    orderBy: {
      id: "asc"
    },
    include: {
      goalTransactions: {
        include: {
          transaction: true
        }
      },
      sourceWallet: {
        include: {
          market: true
        }
      },
      targetWallet: {
        include: {
          market: true
        }
      }
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


export async function getGoal(userId: number, id: number) {
  const goal = await prisma.goal.findUnique({
    where: {
      id,
      userId
    },
    include: {
      goalTransactions: {
        include: {
          transaction: {
            include: {
              item: true,
              wallet: {
                include: {
                  market: true
                }
              }
            }
          }
        }
      },
      sourceWallet: true,
      targetWallet: true
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


export async function createGoal(userId: number, data: createGoalData) {
  return await prisma.$transaction(async (tx) => {
    let status = "QUEUED" as GoalStatus
    
    if(!data) {
      throw new Error("data doesn't")
    }
    const activeGoal = await tx.goal.findFirst({
      where: {
        userId,
        sourceWalletId: data.sourceWalletId,
        status: "ACTIVE"
      }
    })
    
    if(!activeGoal) {
      status = "ACTIVE"
    }

    const invest = currencyCheck(new Prisma.Decimal(data.targetInvestment), data.investCurrency)
    const receive = currencyCheck(new Prisma.Decimal(data.targetReceive), data.receiveCurrency)

    return await tx.goal.create({
      data: {
        userId,
        sourceWalletId: data.sourceWalletId,
        targetWalletId: data.targetWalletId,
        status: status,
        
        name: data.name,
        description: data?.description,
        targetInvestment: invest,
        targetReceive: receive,
      }
    })
  })
}


export async function updateGoal(userId: number, id: number,  data: updateGoalData) {
  return await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findUnique({
      where: {
        id,
        userId
      }
    })

    if(!goal) {
      throw new Error("Goal not found")
    }
    
    const invest = currencyCheck(new Prisma.Decimal(data.goal.targetInvestment), data.goal.investCurrency)
    const receive = currencyCheck(new Prisma.Decimal(data.goal.targetReceive), data.goal.receiveCurrency)


    return await tx.goal.update({
      where: {
        id,
        userId
      },
      data: {
        sourceWalletId: data.goal.sourceWalletId,
        targetWalletId: data.goal.targetWalletId,
        status: data.goal?.status,
        
        name: data.goal.name,
        description: data.goal?.description,
        targetInvestment: new Prisma.Decimal(invest),
        targetReceive: new Prisma.Decimal(receive),
      }
    })
  })
}

export async function activateGoal(userId: number, id: number) {
  return await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findUnique({
      where: {
        id,
        userId
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
        sourceWalletId: goal.sourceWalletId
      }
    })

    if(oldActive) {
      await tx.goal.update({
        where: {
          id: oldActive.id,
          userId
        }, 
        data: {
          status: "QUEUED"
        }
      })
    }

    return await tx.goal.update({
      where: {
        id,
        userId
      }, 
      data: {
        status: "ACTIVE"
      }
    })
  })
}


export async function completeGoal(userId: number, id: number, data: updateGoalData) {
  return await prisma.$transaction(async (tx) => {
    const goalData = data.goal
    const goal = await tx.goal.findUnique({
      where: {
        id,
        userId
      }
    })

    if(!goal) {
      throw new Error("Goal doesn't exist")
    }


    // calculation of goal deviation 
    const deviation = getAmountDeviation(Number(goal.targetReceive))
    const spent = goalData.targetSpend

    if(deviation.rMin > spent || spent > deviation.rMax) {
      throw new Error("Goal doesn't complete")
    }

    return await tx.goal.update({
      where: {
        id,
        userId
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


export async function deleteGoal(userId: number, id: number) {
  return await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findUnique({
      where: {
        id,
        userId
      }
    })

    if(!goal) {
      throw new Error("Goal not found")
    }

    const deleteGoal = await tx.goal.delete({
      where: {
        id,
        userId
      }
    })

    return deleteGoal
  })
}


function getAmountDeviation(received: number) {
  const k = 0.5
  const deviation = k * Math.sqrt(received)
  const receivedMax = received + deviation
  const receivedMin = received * 0.98

  return {dev: deviation, rMax: receivedMax, rMin: receivedMin}
}
import { Prisma } from "@prisma/client";
import type { SyncTransaction, SyncMethod } from "../types/goalTransaction.types";

export async function syncTransactionGoal(tx: Prisma.TransactionClient, transaction: SyncTransaction, method: SyncMethod) {
  if(transaction.id == null) {
    throw new Error("Transaction id doesn't exits")
  }

  let goal = null
    
  if(transaction.type === "BUY") {
    goal = await tx.goal.findFirst({
      where: {
        sourceWalletId: transaction.walletId,
        status: "ACTIVE"
      }
    })
  } else {
    goal = await tx.goal.findFirst({
      where: {
        targetWalletId: transaction.walletId,
        status: "ACTIVE"
      }
    })
  }

  if(method === "CREATE") {
  
    if(!goal) {
      return null
    }

    return await tx.goalTransaction.create({
      data: {
        goalId: goal.id,
        transactionId: transaction.id
      }
    })
  } 

  if(method === "UPDATE") {
    const goalTransaction = await tx.goalTransaction.findFirst({
      where: {
        transactionId: transaction.id
      },
      include: {
        goal: true
      }
    })

    if(!goalTransaction) {
      if(!goal) {
        return null
      }
      return await tx.goalTransaction.create({
        data: {
          goalId: goal.id,
          transactionId: transaction.id
        }
      })
    }

    const isCorrectGoal = transaction.type === "BUY"
      ? goalTransaction.goal.sourceWalletId === transaction.walletId
      : goalTransaction.goal.targetWalletId === transaction.walletId

    if(isCorrectGoal) {
      return goalTransaction
    }

    if(!goal) {
      return await tx.goalTransaction.delete({
        where: {
          id: goalTransaction.id
        }
      })
    }

    return await tx.goalTransaction.update({
      where: {
        id: goalTransaction.id
      },
      data: {
        goalId: goal.id
      }
    })

  }


  //Delete
  if(method === "DELETE") {
    const goalTransaction = await tx.goalTransaction.findFirst({
      where: {
        transactionId: transaction.id
      }
    })

    if(!goalTransaction) {
      return null
    }

    return await tx.goalTransaction.delete({
      where: {
        id: goalTransaction.id
      }
    })
  }
}
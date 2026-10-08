import { TransactionType } from "@prisma/client"

export type SyncMethod = "CREATE" | "UPDATE" | "DELETE";

export type SyncTransaction = {
  id: number
  type: TransactionType
  marketId: number
}
export type WalletType = {
  userId: number,
  balance: number,
  currency: string,
  marketId: number,     
  steamUserId?: number,
}

export type WalletUpdateType = {
  balance: number
}
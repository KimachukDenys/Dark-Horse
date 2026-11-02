import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { WalletType, WalletUpdateType } from "../types/wallet.type";
import prisma from "../lib/prisma";

export async function getWallets(userId: number) {
  const wallets = await prisma.wallet.findMany({
    where: {
      userId
    },
    include: {
      market: true
    }
  })

  return wallets
}

export async function getWallet(userId: number, id: number) {
  const wallet = await prisma.wallet.findUnique({
    where: {
      id,
      userId
    },
    include: {
      market: true
    }
  })

  if(!wallet) {
    throw new Error("Wallet doesn't exist") 
  }
  console.log(wallet)
  return wallet
}


export async function createWallet(userId: number, data: WalletType) {
  const wallet = await prisma.wallet.create({
    data: {
      userId,
      balance: data.balance,
      marketId: data.marketId, 
      steamUserId: data?.steamUserId,
    }
  })

  return wallet
}


export async function updateWalletBalance(
  tx: Prisma.TransactionClient,
  id: number,
  userId: number,
  price: Decimal,
  plus: boolean
) {
  const wallet = await tx.wallet.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const balance = new Prisma.Decimal(wallet.balance);

  const newBalance = plus
    ? balance.plus(price)
    : balance.minus(price);

  return tx.wallet.update({
    where: {
      id,
      userId
    },
    data: {
      balance: newBalance,
    },
  });
}

export async function updateWallet(userId: number, id: number, data: WalletUpdateType) {
  return prisma.$transaction(async (tx) => {
    const walletCheck = await tx.wallet.findUnique({
      where: {
        id,
        userId
      }
    })

    if(!walletCheck) {
      throw new Error("Wallet doesn't exist")
    }

    return await tx.wallet.update({
      where: {
        id,
        userId
      }, 
      data: {
        balance: data.balance
      }
    }) 
  })
}

export async function deleteWallet(userId: number, id: number) {
  return await prisma.wallet.delete({
    where: {
      id,
      userId
    }
  });
}
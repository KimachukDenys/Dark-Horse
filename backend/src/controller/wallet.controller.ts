import { Request, Response } from "express";
import { 
  getWallets as getWalletsService,
  getWallet as getOneWalletService,
  createWallet as createWalletService,
  updateWallet as updateWalletService
} from "../service/wallet.service";

export async function getWallets(req: Request, res: Response) {
  try {
    const userId = req.session.userId!
    const wallets = await getWalletsService(userId);

    return res.json({
      data: wallets
    })
  } catch (e: unknown) {
    if(e instanceof Error) {
      return res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function getOneWallet(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const userId = req.session.userId!

    const wallet = await getOneWalletService(userId, id)

    return res.json({
      data: wallet
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Wallet doesn't exist") {
      return res.status(404).json({
        message: "Wallet doesn't exist"
      })
    }

    if(e instanceof Error) {
      return res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function createWallet(req: Request, res: Response) {
  try {
    const userId = req.session.userId!
    const wallet = await createWalletService(userId, req.body)

    return res.status(201).json({
      message: "Wallet created successfully",
      data: wallet
    })
  } catch (e: unknown) {
    if(e instanceof Error) {
      return res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function updateWallet(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const userId = req.session.userId!

    await updateWalletService(userId, id, req.body)

    return res.status(203).json({
      message: "Wallet updated successfully"
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Wallet doesn't exist") {
      return res.status(404).json({
        message: "Wallet doesn't exist"
      })
    }

    if(e instanceof Error) {
      return res.status(500).json({
        message: e.message
      })
    }
  }
}
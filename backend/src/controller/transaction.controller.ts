// src/controller/transaction.controller.ts

import { Request, Response } from "express";
import {
  getAllTransactions as getAllTxService,
  getTransaction as getTxService,
  createTransaction as createTxService,
  updateTransaction as updateTxService,
  deleteTransaction as deleteTxService,
  getAllNotSoldTx as getAllNotSoldTxService,
  getAllTransactionRoad as getAllTxRoadService,
  updateTxStatus as updateTxStatusService
} from "../service/transaction.service";

export async function getAllTransactions(req: Request, res: Response) {
  try {
    const transactions = await getAllTxService(req.query);

    res.json({
      message: "Transactions gets successfully",
      data: transactions
    });
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Transactions don't exists") {
      res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function getTransaction(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const transaction = await getTxService(id)

    res.json({
      message: "Transaction get successfully",
      data: transaction
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Transaction doesn't exists") {
      res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function createTransaction(req: Request, res: Response) {
  try {
    const txData = await createTxService(req.body)

    res.status(203).json({
      message: "Transaction created successfully",
      market: txData.market,
      wallet: txData.wallet,
      item: txData.item,
      transaction: txData.transaction
    })
  } catch (e: unknown) {
    if(
      (e instanceof Error && e.message === "Market not found") ||
      (e instanceof Error && e.message === "Wallet not found")
    ) {
      return res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error && e.message === "Insufficient funds") {
      return res.status(402).json({
        message: e.message
      })
    }

    if(e instanceof Error && e.message === "Source transaction not found") {
      return res.status(400).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      return res.status(500).json({
        message: e.message
      })
    }
  }
}


export async function updateTransaction(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const updTxData = await updateTxService(id, req.body)

    res.json({
      message: "Transaction updated successfully",
      market: updTxData.market,
      wallet: updTxData.wallet,
      item: updTxData.item,
      transation: updTxData.updateTx,
    })
  } catch (e) {
    if(
      (e instanceof Error && e.message === "Market not found") ||
      (e instanceof Error && e.message === "Wallet not found") ||
      (e instanceof Error && e.message === "Item not found") ||
      (e instanceof Error && e.message === "Need itemId to update")
    ) {
      res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}


export async function deleteTransaction(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const delTxData = await deleteTxService(id) 

    res.json({
      message: "Transaction deleted successfully",
      market: delTxData.market,
      wallet: delTxData.wallet,
      item: delTxData.item,
      transaction: delTxData.deleteTx,
    })
  } catch (e) {
    if(
      (e instanceof Error && e.message === "Market not found") ||
      (e instanceof Error && e.message === "Wallet not found") ||
      (e instanceof Error && e.message === "Item not found")
    ) {
      res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}


export async function getAllNotSoldTx(req: Request, res: Response) {
  try {
    const onInventory = await getAllNotSoldTxService()

    res.json({
      message: "Data gets successfully",
      data: onInventory
    })    
  } catch (e) {
    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function getAllTransactionRoad(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const txs = await getAllTxRoadService(id);
    
    res.json({
      message: "Transaction road get successfully",
      data: txs
    })
  } catch (e) {
    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function updateTxStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    await updateTxStatusService(id, req.body.quantity)

    res.json({
      message: "Transaction status updated successfully"
    })

  } catch (e) {
    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}
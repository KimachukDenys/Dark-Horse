//  src/controller/market.controller.ts

import { Request, Response } from "express"
import { 
  getAllMarkets as allMarketsService,
  getMarket as marketService,
  createMarket as createMarketService,
  deleteMarket as deleteMarketService,
  updateWalletBalance as updateWalletService
} from "../service/market.service.js";



export async function getAllMarkets(req: Request, res: Response) {
  try {
    const markets = await allMarketsService();

    res.status(200).json({
      message: "Markets gets successfully",
      data: markets,
    });

  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Markets don't exists") {
      return res.status(404).json({
        message: e.message
      });
    }

    return res.status(500).json({
      message: "Internal server Error"
    })
  }
}


export async function getMarket(req: Request, res : Response) {
  try {
    const id = Number(req.params.id);

    const market = await marketService(id);
    
    res.json({
      message: "Market get successfully",
      data: market
    });
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Market doesn't exists") {
      return res.status(404).json({
        message: e.message
      });
    }

    return res.status(500).json({
      message: "Internal server Error"
    });
  }
}


export async function createMarket(req: Request, res: Response) {
  try {
    const result = await createMarketService(req.body);

    res.status(201).json({
      message: "Market created successfully",
      market: result.newMarket,
      wallet: result.wallet
    });
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Market already exists") {
      return res.status(409).json({
        message: e.message
      });
    }

    return res.status(500).json({
      message: "Internal server Error"
    });
  }
}


export async function deleteMarket(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    await deleteMarketService(id)

    res.json({
      message: "Market deleted successfully"
    });
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Market doesn't exists") {
      return res.status(404).json({
        message: e.message
      });
    }

    return res.status(500).json({
      message: "Internal server Error"
    });
  }
}
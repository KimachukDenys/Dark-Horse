//  src/controller/market.controller.ts

import { Request, Response } from "express"
import { 
  getAllMarkets as allMarketsService,
  getMarket as marketService,
  createMarket as createMarketService,
  deleteMarket as deleteMarketService,
  updateMarket as updateMarketService,
  getAvailableMarkets as getAvailableMarketsService,
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
      message: "Market got successfully",
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

export async function getAvailableMarkets(req: Request, res: Response) {
  try {
    const userId = req.session.userId!

    const markets = await getAvailableMarketsService(userId)

    return res.json({
      data: markets
    })
  } catch (e: unknown) {
    if(e instanceof Error) {
      return res.status(500).json({
        message: e.message
      })
    }
  }
}


export async function createMarket(req: Request, res: Response) {
  try {
    console.log(req.body)
    const market = await createMarketService(req.body);

    res.status(201).json({
      message: "Market created successfully",
      data: market,
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


export async function updateMarket(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)

    await updateMarketService(id, req.body)

    res.json({
      message: "Market updated successfully" 
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Not enough data to update Market") {
      res.status(417).json({
        message: e.message
      })
    }

    if(e instanceof Error && e.message === "Market doesn't exist") {
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
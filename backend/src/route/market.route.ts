//  src/route/market.route.ts

import { Router } from "express";
import { 
  getAllMarkets as allMarketsController,
  getMarket as marketController,
  createMarket as createMarketController,
  deleteMarket as deleteMarketController,
} from "../controller/market.controller.js";

const router = Router();

router.get("/", allMarketsController)
router.get("/:id", marketController)

router.post("/create", createMarketController)

router.delete("/delete/:id", deleteMarketController)

export default router
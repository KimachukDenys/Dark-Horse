//  src/route/market.route.ts

import { Router } from "express";
import { 
  getAllMarkets as allMarketsController,
  getMarket as oneMarketController,
  getAvailableMarkets as getAvailableMarketsController,
  createMarket as createMarketController,
  updateMarket as updateMarketController,
  deleteMarket as deleteMarketController,
} from "../controller/market.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/available", requireAuth, getAvailableMarketsController)
router.get("/", requireAuth, allMarketsController)
router.get("/:id", requireAuth, oneMarketController)

router.post("/create", requireAuth, createMarketController)
router.patch("/update/:id", requireAuth, updateMarketController)
router.delete("/delete/:id", requireAuth, deleteMarketController)

export default router
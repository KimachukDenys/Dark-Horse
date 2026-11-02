// src/route/item.route.ts

import { Router } from "express";
import {
  getAllItems as allItemsController,
  getItem as getItemController,
  createItem as createItemController,
  updateItem as updateItemController,
  deleteItem as deleteItemController,
  apiSearch
} from "../controller/item.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/steam/test", apiSearch)
router.get("/", allItemsController);
router.get("/:id", getItemController);


router.post("/create", requireAuth, createItemController);
router.patch("/update/:id", requireAuth, updateItemController);
router.delete("/delete/:id", requireAuth, deleteItemController);

export default router
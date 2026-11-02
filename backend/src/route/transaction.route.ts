// src/route/transaction.route.ts

import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { 
  getAllTransactions as getAllTxController,
  getTransaction as getTXControlle,
  createTransaction as createTxController,
  updateTransaction as updateTxController,
  deleteTransaction as deleteTxController,
  getAllNotSoldTx as getAllNotSoldTxController,
  getAllTransactionRoad as getAllTxRoadController,
  updateTxStatus as updateTxStatusController
} from "../controller/transaction.controller";

const router = Router();

router.get("/", requireAuth, getAllTxController);
router.get("/get-inventory", requireAuth, getAllNotSoldTxController);
router.get("/trade/:id", requireAuth, getAllTxRoadController);
router.get("/:id", requireAuth, getTXControlle);
router.post("/create/tx", requireAuth, createTxController);

router.patch("/update/:id", requireAuth, updateTxController);
router.patch("/update-status/:id", requireAuth, updateTxStatusController)
router.delete("/delete/:id", requireAuth, deleteTxController);


export default router
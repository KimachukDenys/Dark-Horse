// src/route/transaction.route.ts

import { Router } from "express";
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

router.get("/", getAllTxController);
router.get("/get-inventory", getAllNotSoldTxController);
router.get("/trade/:id", getAllTxRoadController);
router.get("/:id", getTXControlle);
router.post("/create/tx", createTxController);

router.patch("/update/:id", updateTxController);
router.patch("/update-status/:id", updateTxStatusController)
router.delete("/delete/:id", deleteTxController);


export default router
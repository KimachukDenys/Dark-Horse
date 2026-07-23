// src/route/transaction.route.ts

import { Router } from "express";
import { 
  getAllTransactions as getAllTxController,
  getTransaction as getTXControlle,
  createTransaction as createTxController,
  updateTransaction as updateTxController,
  deleteTransaction as deleteTxController
} from "../controller/transaction.controller";

const router = Router();

router.get("/", getAllTxController);
router.get("/:id", getTXControlle);

router.post("/create", createTxController);
router.patch("/update/:id", updateTxController);
router.delete("/delete/:id", deleteTxController);


export default router
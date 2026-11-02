import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { 
  getWallets as getWalletsController,
  getOneWallet as getOneWalletController,
  createWallet as createWalletController,
  updateWallet as updateWalletControllet,
} from "../controller/wallet.controller";

const router = Router();

router.get("/", requireAuth, getWalletsController);
router.get("/:id", requireAuth, getOneWalletController);
router.post("/create", requireAuth, createWalletController);
router.patch("/update/:id", requireAuth, updateWalletControllet)

export default router 
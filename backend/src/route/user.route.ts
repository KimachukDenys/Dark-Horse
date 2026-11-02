import { Router } from "express";
import { 
  login as loginController,
  register as registerController,
  getMe,
  logout,
} from "../controller/user.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router()

router.post("/register", registerController)
router.post("/login", loginController)
router.get("/me", requireAuth, getMe)
router.delete("/logout", requireAuth, logout)

export default router
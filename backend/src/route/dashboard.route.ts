// src/route/dashboard.route.ts

import { Router } from "express";
import {
  getDashboard as getDashboardController
} from "../controller/dashboard.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", requireAuth, getDashboardController)

export default router
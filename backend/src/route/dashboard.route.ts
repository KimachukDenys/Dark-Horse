// src/route/dashboard.route.ts

import { Router } from "express";
import {
  getDashboard as getDashboardController
} from "../controller/dashboard.controller";

const router = Router();

router.get("/", getDashboardController)

export default router
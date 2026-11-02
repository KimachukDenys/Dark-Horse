// src/route/goal.route.ts

import { Router } from "express";
import { 
  getAllGoals as getAllGoalsController,
  getGoal as getGoalController,
  createGoal as createGoalController,
  updateGoal as updateGoalController,
  activateGoal as activateGoalController,
  completeGoal as completeGoalController,
  deleteGoal as deleteGoalController
} from "../controller/goal.controller";
import { requireAuth } from "../middleware/requireAuth";


const router = Router();

router.get("/", requireAuth, getAllGoalsController);
router.get("/get/:id", requireAuth, getGoalController);

router.post("/create", requireAuth, createGoalController);
router.patch("/update/:id", requireAuth, updateGoalController);
router.patch("/activate/:id", requireAuth, activateGoalController)
router.patch("/complete/:id", requireAuth, completeGoalController);
router.delete("/delete/:id", requireAuth, deleteGoalController)

export default router
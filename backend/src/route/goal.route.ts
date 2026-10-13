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


const router = Router();

router.get("/", getAllGoalsController);
router.get("/get/:id", getGoalController);

router.post("/create", createGoalController);
router.patch("/update/:id", updateGoalController);
router.patch("/activate/:id", activateGoalController)
router.patch("/complete/:id", completeGoalController);
router.delete("/delete/:id", deleteGoalController)

export default router
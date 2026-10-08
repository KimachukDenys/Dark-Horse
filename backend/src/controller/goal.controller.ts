
import { Request, Response } from "express";
import { 
  getAllGoals as getAllGoalsService,
  getGoal as getGoalService,
  createGoal as createGoalService,
  updateGoal as updateGoalService,
  completeGoal as completeGoalService,
  deleteGoal as deleteGoalService
} from "../service/goal.service";


export async function getAllGoals(req: Request, res: Response) {
  try {
    const goals = await getAllGoalsService()

    res.json({
      message: "Goals gets successfully",
      data: goals
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Goals don't exists") {
      res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
} 


export async function getGoal(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const goal = await getGoalService(id)
    
    res.json({
      message: "Goal got successfully",
      data: goal
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Goal not found") {
      res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function createGoal(req: Request, res: Response) {
  try {
    const newGoal = await createGoalService(req.body)

    res.status(203).json({
      message: "Goal created successfully",
      data: newGoal
    })
  } catch (e: unknown) {
    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}


export async function updateGoal(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)

    const updateGoal = await updateGoalService(id, req.body)

    res.json({
      message: "Goal updated successfully",
      data: updateGoal
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Goal not found") {
      res.status(404).json({
        message: e.message
      })
    }
    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}


export async function completeGoal(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    
    const complGoal = await completeGoalService(id, req.body)

    res.status(203).json({
      message: "Goal completed successfully",
      data: complGoal
    })
  } catch (e) {
    if(e instanceof Error && e.message === "Goal doesn't exist") {
      res.status(400).json({
        message: e.message
      })
    }

    if(e instanceof Error && e.message === "Goal doesn't complete") {
      res.status(417).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        messsage: e.message
      })
    }
  }
}


export async function deleteGoal(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)

    const delGoal = await deleteGoalService(id)

    res.json({
      message: "Goal deleted successfully",
      data: delGoal
    })
  } catch (e) {
    if(e instanceof Error && e.message === "Goal not found") {
      res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}
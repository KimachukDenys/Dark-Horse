import { Request, Response } from "express";
import { getDashboard as getDashboardService } from "../service/dashboard.service";

export async function getDashboard(req: Request, res: Response) {
  try {
    const now = new Date()
    const monthBefore = new Date(now)
    monthBefore.setMonth(now.getMonth() - 1)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0,0,0,0)

    const reqDate = req.query as {from: string, to: string}

    const from = reqDate.from ? new Date(reqDate.from) : monthBefore
    const to = reqDate.to ? new Date(reqDate.to) : tomorrow

    const transactions = await getDashboardService(from, to)

    res.json({
      message: "Dashboard data got successfully",
      data: transactions
    })
  } catch (e: unknown) {
    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}

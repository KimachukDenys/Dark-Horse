import { formatDate } from "../../utils/date";
import { Link } from "react-router-dom";
import React from "react";
import { api } from "../../api/axios";
import type { GoalsType } from "../../types/goal.types";
import type { Notification } from "../../types/global.types";
import { GoalStatusAndColor } from "../../types/goal.types";
import "../../styles/goal/goalCard.css"
import "../../styles/goal/goalMain.css"
import axios from "axios";

type GoalCardProps = {
  goalInfo: GoalsType,
  onChange: () => void,
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>
}

function GoalCard({goalInfo, onChange, setNotification}: GoalCardProps) {
  const goal = goalInfo.goal
  const stats = goalInfo.stats

  const createdAt = formatDate(goal.createdAt)
  const status = GoalStatusAndColor[goal.status]

  const returnPercent = Number(goal.targetReceive) !== 0 ? (Number(stats.spent)/Number(goal.targetReceive)) * 100 : 0
  const progressWidth = returnPercent > 0 && returnPercent <= 13 ? 13 : Math.min(returnPercent, 100)
  const receivedColor = goal.status === "COMPLETED" ? "var(--complete)" :
    Number(goal.targetReceive) !== 0 && Number(goal.targetReceive) <= stats.spent ? "var(--accent-border)" : "var(--accent-red)"
  const progressColor = goal.status === "COMPLETED" ? "var(--complete)" :
    returnPercent >= 100 ? "var(--accent-border)" : "var(--accent)"

  const sourceMarketName = goal.sourceMarket.name
  const targetMarketName = goal.targetMarket.name

  async function changeGoal(action: "activate" | "complete" | "delete") {
    try {
      let message: string = ""

      if (action === "activate") {
        await api.patch(`goal/activate/${goal.id}`)
        message = `Goal #${goal.id} activated successfully!`
      }

      if (action === "complete") {
        const body = {
          goal: {
            sourceMarketId: goal.sourceMarketId,
            targetMarketId: goal.targetMarketId,
            status: goal.status,
            name: goal.name,
            description: null,
            targetInvestment: goal.targetInvestment,
            targetReceive: goal.targetReceive,
            targetSpend: stats.spent,
            targetReturn: stats.returned
          },
          update: {
            closedAt: new Date()
          }
        }

        await api.patch(`/goal/complete/${goal.id}`, body)
        message = `Goal #${goal.id} completed successfully!`
      }

      if (action === "delete") {
        await api.delete(`/goal/delete/${goal.id}`)
        message = `Goal #${goal.id} deleted successfully!`
      }
      
      setNotification({
        id: Date.now(),
        message,
        type: "success"
      })
      onChange()
    } catch (e: unknown) {
      if(axios.isAxiosError(e)) {
        console.log(e)
        console.log(e.response?.data)
        setNotification({
          id: Date.now(),
          message: e.response?.data?.message ,
          type: "error"
        })
      }
    }
  }


  return (
    <div className="goal-card">
      <div className="goal-card-header">
        <Link to={`/goal/${goal.id}`} className="info-link">#{goal.id}</Link>
        <div className="goal-status">
          <div className="status-indecator" style={{background: status.color}}></div>
          <p>{status.name}</p>
        </div>
      </div>

      <div className="goal-line"></div>

      <div className="goal-card-info">
        {goal.name && (
          <p className="gc-name">Name: <strong> {goal.name}</strong></p>
        )}
        <div className="gc-info-format">
          <p>Markets:</p>
          <strong>{sourceMarketName} <span>to</span> {targetMarketName}</strong>
        </div>
        <div className="gc-profit-info">
          <div className="gc-profit-format">
            <p>Invest:</p>
            <strong>{goal.targetInvestment}$</strong>
          </div>
          <div className="gc-profit-format">
            <p>Receive:</p>
            <strong>{goal.targetReceive}$</strong>
          </div>
            {goal.status === "COMPLETED" ? (
              <div className="gc-profit-format">
                <p>Return:</p>
                <strong style={{color: receivedColor}}>{goal.targetReturn}$</strong>
              </div>
            ) : (
              <div className="gc-profit-format">
                <p>Spent:</p>
                <strong style={{color: receivedColor}}>{stats.spent}$</strong>
              </div>
            )}
        </div>
        
        <div className="goal-progress">
          <div className="progress-bar" style={{border: `2px solid ${progressColor}`}}>
            <div className="progress-percents" style={
              {width: `${progressWidth}%`,
              background: progressColor}}>
              </div>
          </div>
          <p>{returnPercent.toFixed(2)}%</p>
        </div>

      </div>
      
      <div className="goal-card-footer">
        <div className="goal-line to-bottom"></div>
        <div className="goal-card-actions">
          <p>Created: <strong>{createdAt.date}</strong></p>
          {goal.status === "QUEUED" && (
            <button type="button" className="success-btn btn-default" onClick={() => changeGoal("activate")}>Activate</button>
          )}
          {goal.status === "ACTIVE" && goal.targetReceive <= stats.spent && (
            <button type="button" className="complete-btn btn-default" onClick={() => changeGoal("complete")}>Complete</button>
          )}
          <Link className="warning-btn btn-default" to={`/edit-goal/${goal.id}`}>Edit</Link>
          <button type="button" className="danger-btn btn-default" onClick={() =>changeGoal("delete")}>Delete</button>
        </div>
      </div>
    </div>
  )
}

export default GoalCard
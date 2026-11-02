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


function deviationCalculation(received: number) {
  const k = 0.5
  const deviation = k * Math.sqrt(received)
  const receivedMax = Number(received) + deviation
  const receivedMin = Number(received) * 0.99
  return {deviation, receivedMax, receivedMin}
}


function buttonsRender(goalInfo: GoalsType, changeGoal: (action: "activate" | "complete" | "delete") => void) {
  const goal = goalInfo.goal
  const stats = goalInfo.stats
  const createdAt = formatDate(goal.createdAt)
  
  const devCalc = deviationCalculation(Number(goal.targetReceive) ?? 0)

  let completeCheck = false
  let message

  if(devCalc.receivedMin < stats.spent && stats.spent < devCalc.receivedMax ) {
    completeCheck = true
  } else if(stats.spent > devCalc.receivedMax) {
    message = (
      <p className="danger-color">
        {`Spent limit is ${Number(devCalc.receivedMax).toFixed(2)}$,
        invest to "Receive" be close to ${Number(stats.spent).toFixed(0)}$`}
      </p>
    )
  }

  return (
    <div className="goal-card-actions">
      <p>Created: <strong>{createdAt.date}</strong></p>
      {message}
      
      {goal.status === "QUEUED" && (
        <button type="button" className="success-btn btn-default" onClick={() => changeGoal("activate")}>Activate</button>
      )}
      
      {goal.status === "ACTIVE" && completeCheck && (
        <button type="button" className="complete-btn btn-default" onClick={() => changeGoal("complete")}>Complete</button>
      )}
      
      <Link className="warning-btn btn-default" to={`/edit-goal/${goal.id}`}>Edit</Link>
      
      <button type="button" className="danger-btn btn-default" onClick={() =>changeGoal("delete")}>Delete</button>
    </div>
  )
}



function progressRender(goalInfo: GoalsType) {
  const goal = goalInfo.goal
  const stats = goalInfo.stats

  const returnPercent = Number(goal.targetReceive) !== 0 ? (Number(stats.spent)/Number(goal.targetReceive)) * 100 : 0

  const progressWidth = returnPercent > 0 && returnPercent <= 13 ? 13 : Math.min(returnPercent, 100)
  let progressColor = goal.status === "COMPLETED" ? "var(--complete)" :
    returnPercent >= 99 ? "var(--accent-border)" : "var(--accent)"

  const devCalc = deviationCalculation(Number(goal.targetReceive) ?? 0)

  if(devCalc.receivedMax < stats.spent) {
    progressColor = "var(--accent-red)"
  }

  
  return (
    <div className="goal-progress">
      <div className="progress-bar" style={{border: `2px solid ${progressColor}`}}>
        <div className="progress-percents" style={
          {width: `${progressWidth}%`,
          background: progressColor}}>
          </div>
      </div>
      <p style={{color: progressColor}}>{returnPercent.toFixed(2)}%</p>
    </div>
  )
}





type GoalCardProps = {
  goalInfo: GoalsType,
  onChange: () => void,
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>
}

function GoalCard({goalInfo, onChange, setNotification}: GoalCardProps) {
  const goal = goalInfo.goal
  const stats = goalInfo.stats
  const status = GoalStatusAndColor[goal.status]

  const receivedColor = goal.status === "COMPLETED" ? "var(--complete)" :
    Number(goal.targetReceive) !== 0 && Number(goal.targetReceive)*0.99 <= stats.spent ? "var(--accent-border)" : "var(--accent-red)"


  const sourceWalletName = goal.sourceWallet.market.name
  const targetWalletName = goal.targetWallet.market.name

  

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
            sourceWalletId: goal.sourceWalletId,
            targetWalletId: goal.targetWalletId,
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
          <p>Wallets:</p>
          <strong>{sourceWalletName} <span>to</span> {targetWalletName}</strong>
        </div>
        <div className="gc-profit-info">
          <div className="gc-profit-format">
            <p>Invest:</p>
            <strong>{Number(goal.targetInvestment).toFixed(2)}$</strong>
          </div>
          <div className="gc-profit-format">
            <p>Receive:</p>
            <strong>{Number(goal.targetReceive).toFixed(2)}$</strong>
          </div>
            {goal.status === "COMPLETED" ? (
              <div className="gc-profit-format">
                <p>Return:</p>
                <strong style={{color: receivedColor}}>{Number(goal.targetReturn).toFixed(2)}$</strong>
              </div>
            ) : (
              <div className="gc-profit-format">
                <p>Spent:</p>
                <strong style={{color: receivedColor}}>{Number(stats.spent).toFixed(2)}$</strong>
              </div>
            )}
        </div>
        
        {progressRender(goalInfo)}

      </div>
      
      <div className="goal-card-footer">
        <div className="goal-line to-bottom"></div>
        {buttonsRender(goalInfo, changeGoal)}
      </div>
    </div>
  )
}

export default GoalCard
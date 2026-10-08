import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/axios";
import { MarketName } from "../../types/market.types";
import { GoalStatusAndColor } from "../../types/goal.types";
import type { GoalType } from "../../types/goal.types";
import Notification from "../../components/notification/Notification";
import TransactionCard from "../../components/cards/TransactionCard";
import { profitColorCheck } from "../../utils/color";
import "../../styles/goal/goalInfoPage.css"
import "../../styles/goal/goalMain.css"

function GoalInfoPage() {
  const {goalId} = useParams()

  const [data, setdata] = useState<GoalType | null>(null)
  const [notification, setNotification] = useState<{
    id: number,
    message: string,
    type: string,
  }| null>(null)


  async function getGoal() {
    try {
      if(!goalId) {
        return null
      }
      const res = await api.get(`/goal/get/${goalId}`)
      setdata(res.data.data)
    } catch (e) {
      console.log(e)
      setNotification({
        id: Date.now(),
        message: "Something went wrong",
        type: "error"
      })
    }
  }

  useEffect(() => {
    getGoal()
  }, [])
  
  if(!data) {
    return 
  }

  const transactions = data.goal.goalTransactions.map((item) => item.transaction)
  const goal = data.goal
  const stats = data.stats

  const sourceMarketName = MarketName[goal.sourceMarket.name]
  const targetMarketName = MarketName[goal.targetMarket.name]
  const status = GoalStatusAndColor[goal.status]

  const progressColor = status.name === "Completed" ? "var(--complete)" :
    stats.progres >= 100 ? "var(--accent-border)" : "var(--accent)"

  const investRoi = (goal.targetReceive-goal.targetInvestment)/goal.targetInvestment*100
  const diff = goal.targetReceive-goal.targetInvestment

  const investColor = profitColorCheck(investRoi)
  const profitColor = profitColorCheck(stats.profit)
  const profitSign = stats.profit >= 0 ? "+" : ""

  return (
    <div className="goal-container">
      <div className="goal-info-header">
        <h3>Goal Info Page</h3>
      </div>

      <div className="goal-info-container">
      
        <div className="goal-main-info">
          <div className="goal-card-header">
            <div className="goal-name">
              <p>#{goal.id}</p>
              <p>{goal.name}</p>
            </div>
            <div className="goal-status">
              <div className="goal-status-indecator" style={{background: `${status.color}`}}></div>
              <p>{status.name}</p>
            </div>
          </div>

          <div className="goal-markets-info">
            <strong>{sourceMarketName}</strong><p>to</p><strong>{targetMarketName}</strong>
          </div>

          <div className="goal-progress">
            <div className="progress-bar" style={{border: `2px solid ${progressColor}`}}>
              <div className="progress-percents" style={
                {width: `${stats.progres}%`,
                background: progressColor}}>
              </div>
            </div>
            <p>{stats.progres}%</p>
          </div>
          <div className="goal-description">
            <strong>Description:</strong>
            <p>{goal.description}</p>
          </div>
        </div>

        <div className="goal-stats-info">
          <h3>Goal Stats Info:</h3>
          <div className="gs-start">
            <div className="gs-left-side">
              <div className="gs-highlight">
                <p>Receive <span>({sourceMarketName})</span></p>
                <strong>{goal.targetReceive}$</strong>
              </div>
              <div className="gs-highlight">
                <p>Investments <span>({targetMarketName})</span></p>
                <strong>{goal.targetInvestment}$</strong>
              </div>
            </div>
            <div>
              <p>Diff</p>
              <strong className={investColor}>{diff}$</strong>
            </div>
            <div className="gs-highlight">
              <p>ROI:</p>
              <strong className={investColor}>{investRoi}%</strong>
            </div>
          </div>

          <div className="gs-start">
            <div className="gs-left-side">

              <div className="gs-highlight">
                <p>Spent <span>({targetMarketName})</span></p>
                <strong>{stats.spent}$</strong>
              </div>
              <div className="gs-highlight">
                <p>Returned <span>({sourceMarketName})</span></p>
                <strong>{stats.returned}$</strong>
              </div>
            </div>
            <div className="gs-highlight">
              <p>Profit</p>
              <strong className={profitColor}>{profitSign}{stats.profit}$</strong>
            </div>
            <div className="gs-highlight">
              <p>ROI:</p>
              <strong className={profitColor}>{profitSign}{stats.roi}%</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="goal-info-header">
        <h3>Transactions:</h3>
      </div>

      <div className="goal-transactions">
        {transactions.map((tx) => (
          <TransactionCard key={tx.id} tx={tx} onDelete={getGoal} setNotification={() => setNotification}/>
        ))}
      </div>

      {notification && (
        <Notification key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )

  
}

export default GoalInfoPage
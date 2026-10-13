import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../../api/axios"
import GoalCard from "../../components/cards/GoalCard"
import Notification from "../../components/notification/Notification"
import type { GoalsType } from "../../types/goal.types"
import "../../styles/goal/goalPage.css"

function GoalPage() {
  const [goals, setGoals] = useState<GoalsType[]>([])
  const [notification, setNotification] = useState<{
    id: number,
    message: string,
    type: "success" | "warning" | "error",
  } | null>(null)

  async function getGoals() {
    const res = await api("/goal")

    setGoals(res.data.data)
  }

  useEffect(() => {
    getGoals()
  },[])

  return (
    <div className="goal-page">
      <div className="goal-header">
        <div className="goal-header-container">
          <h2 className="page-header">Goals</h2>
          <Link className="success-btn btn-default" to={"/create-goal"}>Create Goal</Link>
        </div>
        <div className="goal-line"></div>
      </div>


      <div className="goals-container">
        {goals.map((goalInfo) => (
          <GoalCard key={goalInfo.goal.id} goalInfo={goalInfo} onChange={getGoals} setNotification={setNotification}
          />
        ))}
      </div>

      {notification && (
        <Notification 
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

export default GoalPage
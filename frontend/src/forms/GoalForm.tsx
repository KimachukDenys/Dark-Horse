import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import type { MarketType } from "../types/market.types";
import "../styles/goal/goalForm.css"
import Notification from "../components/notification/Notification";
import axios from "axios";

function GoalForm({edit = false}) {
  const { goalId } = useParams();
  const [markets, setMarkets] = useState<MarketType[]>([])
  const [data, setData] = useState({
    sourceMarketId: "",
    targetMarketId: "",

    goalName: null,
    description: null,
    targetInvestment: null,
    targetReceive: null,
  })

  const [notification, setNotification] = useState<{
    id: number,
    message: string,
    type: string
  } | null> (null);

  const handleInput = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => {
    let {name, value} = e.currentTarget

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(data)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const body = {
      sourceMarketId: Number(data.sourceMarketId),
      targetMarketId: Number(data.targetMarketId),

      name: data.goalName,
      description: data?.description,

      targetInvestment: Number(data.targetInvestment),
      targetReceive: Number(data.targetReceive)
    }

    try {
      let res
      
      if(edit && goalId) {
        const editBody = {
          update: {
            closedAt: null
          },
          goal: body
        }
        res = await api.patch(`/goal/update/${goalId}`, editBody)
      } else {
        res = await api.post("/goal/create", body)
      }

      setNotification({
        id: Date.now(),
        message: res.data.message,
        type: "success"
      })
    } catch (e: unknown) {
      if(axios.isAxiosError(e)) {
        console.log(e)
        setNotification({
          id: Date.now(),
          message: e.response?.data?.message ?? "Something went wrong!",
          type: "error"
        })
      }
    }
  }

  useEffect(() => {
    async function getGoalData() {
      if(edit && goalId) {
        const res = await api.get(`/goal/get/${goalId}`)

        const data = res.data.data

        setData({
          sourceMarketId: String(data.goal.sourceMarketId),
          targetMarketId: String(data.goal.targetMarketId),

          goalName: data.goal.name,
          description: data.goal.description || "",
          targetInvestment: data.goal.targetInvestment,
          targetReceive: data.goal.targetReceive,
        })
        console.log(data)
      }
      console.log(data)
    }

    getGoalData()
  }, [edit])

  useEffect(() => {
    async function getMarkets() {
      const res = await api.get("/market")

      setMarkets(res.data.data)
    }
    getMarkets()
  }, [])

  return (
    <div>
      <h2 className="page-header">{edit ? "Edit" : "Create"} Goal</h2>
      
      <form onSubmit={handleSubmit} className="goal-form">

        <div className="market-container">
          <div className="market-select-container source-market">
          <h4 className="select-header">Source Market</h4>
            {markets.map((market) => {
              return (
                <button key={market.id}
                type="button"
                className={`btn-default ${data.sourceMarketId === `${market.id}` ? "danger-btn active-danger" : "action-btn"}`}
                name="sourceMarketId"
                  value={market.id}
                  onClick={handleInput}
                  >
                  {market.name}
                </button>
              )
            })}
          </div>

          <div className="market-select-container target-market">
          <h4 className="select-header">Target Market</h4>
            {markets.map((market) => {
              return (
                <button key={market.id}
                  type="button"
                  className={`btn-default ${data.targetMarketId === `${market.id}` ? "success-btn active-success" : "action-btn"}`}
                  name="targetMarketId"
                  value={market.id}
                  onClick={handleInput}
                  >
                  {market.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="input-container">
          <div className="input-rel">
            <input id="name"
              className="input-field"
              name="goalName"
              type="text"
              placeholder=" "
              maxLength={30}
              value={data.goalName || ""}
              onChange={handleInput}
            />
            <label className="input-label" htmlFor="name">Goal Name</label>
          </div>

          <div className="input-rel">
            <input id="investments"
              className="input-field"
              name="targetInvestment"
              type="number"
              placeholder=" "
              value={data.targetInvestment || ""}
              onChange={handleInput}
              min={1}
            />
            <label className="input-label" htmlFor="investments">Investments</label>
          </div>

          <div className="input-rel">
            <input id="received"
              className="input-field"
              name="targetReceive"
              type="number"
              placeholder=" "
              value={data.targetReceive || ""}
              onChange={handleInput}
              min={1}
            />
            <label className="input-label" htmlFor="received">Received</label>
          </div>
        </div>

        <div className="input-rel">
          <input id="gName"
            className="input-field"
            name="description"
            type="text"
            placeholder=" "
            value={data.description || ""}
            onChange={handleInput}
          />
          <label className="input-label" htmlFor="gName">Description</label>
        </div>

        <button className="form-btn success-btn btn-default" type="submit">
          {edit ? "Edit" : "Create"}
        </button>
        {notification && (
          <Notification 
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </form>
    </div>
  )
}

export default GoalForm
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import "../styles/goal/goalForm.css"
import Notification from "../components/notification/Notification";
import { CurrencyInput } from "../components/inputs/CurrencyInput";
import { currencyCalculation } from "../utils/calculation";
import axios from "axios";
import { useWallet } from "../hooks/wallet.context";

function GoalForm({edit = false}) {
  const { goalId } = useParams();
  const {wallets} = useWallet()
  const [data, setData] = useState({
    sourceWalletId: "",
    targetWalletId: "",

    goalName: null,
    description: null,
    targetInvestment: 1,
    targetReceive: 1,
    investCurrency: "UAH",
    receiveCurrency: "UAH"
  })
  const [priceInput, setPriceInput] = useState({
    invest: "1",
    receive: "1"
  })

  const [notification, setNotification] = useState<{
    id: number,
    message: string,
    type: string
  } | null> (null);

  const handleInput = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.currentTarget

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handlePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.currentTarget

    const priceField = name === "targetInvestment" ? "invest" : "receive"
    setPriceInput((prev) => ({
      ...prev,
      [priceField]: value
    }));
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  const handleCurrency = (e: React.MouseEvent<HTMLButtonElement>, field: string) => {
    const {name, value} = e.currentTarget

    const targetField = field === "targetInvestment"
      ? {input: data.targetInvestment, currency: data.investCurrency}
      : {input: data.targetReceive, currency: data.receiveCurrency}
    
    const calculation = currencyCalculation(targetField.input, 0, value, targetField.currency)
    
    const priceField = field === "targetInvestment" ? "invest" : "receive"
    
    setPriceInput((prev) => ({
      ...prev,
      [priceField]: calculation.price.toFixed(2)
    }))

    setData((prev) => ({
      ...prev,
      [name]: value,
      [field]: calculation.price
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const body = {
      sourceWalletId: Number(data.sourceWalletId),
      targetWalletId: Number(data.targetWalletId),

      name: data.goalName,
      description: data?.description,

      targetInvestment: Number(data.targetInvestment),
      targetReceive: Number(data.targetReceive),

      investCurrency: data.investCurrency,
      receiveCurrency: data.receiveCurrency

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
        try {
          const res = await api.get(`/goal/get/${goalId}`)

          const data = res.data.data

          setData({
            sourceWalletId: String(data.goal.sourceWalletId),
            targetWalletId: String(data.goal.targetWalletId),

            goalName: data.goal.name,
            description: data.goal.description || "",
            targetInvestment: Number(data.goal.targetInvestment),
            targetReceive: Number(data.goal.targetReceive),
            investCurrency: "USD",
            receiveCurrency: "USD"
          })

          setPriceInput({
            invest: Number(data.goal.targetInvestment).toFixed(2),
            receive: Number(data.goal.targetReceive).toFixed(2)
          })
        } catch (e: unknown) {
          if(axios.isAxiosError(e)) {
            console.log(e)
            setNotification({
              id: Date.now(),
              message: e.response?.data?.message ?? "Something went wrong",
              type: "error"
            })
          }
        }
      }
    }

    getGoalData()
  }, [edit])


  return (
    <div>
      <h2 className="page-header">{edit ? "Edit" : "Create"} Goal</h2>
      
      <form onSubmit={handleSubmit} className="goal-form">

        <div className="market-container">
          <div className="market-select-container source-market">
            <h4 className="select-header">Source Market</h4>
            {wallets.map((w) => {
              return (
                <button key={w.id}
                type="button"
                className={`btn-default ${data.sourceWalletId === `${w.id}` ? "danger-btn active-danger" : "action-btn"}`}
                name="sourceWalletId"
                value={w.id}
                  onClick={handleInput}
                  >
                  {w.market.name}
                </button>
              )
            })}
          </div>

          <div className="market-select-container target-market">
            <h4 className="select-header">Target Market</h4>
              {wallets.map((w) => {
                return (
                  <button key={w.id}
                    type="button"
                    className={`btn-default ${data.targetWalletId === `${w.id}` ? "success-btn active-success" : "action-btn"}`}
                    name="targetWalletId"
                    value={w.id}
                    onClick={handleInput}
                    >
                    {w.market.name}
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

          <CurrencyInput 
            field={{name: "targetInvestment", text: "Investment", width: "70%", type: "number", currencyName: "investCurrency"}}
            price={priceInput.invest}
            currency={data.investCurrency}
            priceInput={handlePrice}
            currencyButton={(e) => handleCurrency(e, "targetInvestment")}
            form="Goal"
          />

          <CurrencyInput 
            field={{name: "targetReceive", text: "Receive", width: "70%", type: "number", currencyName: "receiveCurrency"}}
            price={priceInput.receive}
            currency={data.receiveCurrency}
            priceInput={handlePrice}
            currencyButton={(e) => handleCurrency(e, "targetReceive")}
            form="Goal"
          />
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
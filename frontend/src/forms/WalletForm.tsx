import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import type { WalletType } from "../types/wallet.types";
import type { MarketType } from "../types/market.types";
import Notification from "../components/notification/Notification";
import axios from "axios";
import "../styles/wallet/walletForm.css"




function WalletForm({edit = false}) {
  const {walletId} = useParams()
  const [availMarkets, setAvailMarkets] = useState<MarketType[]>([])
  const [data, setData] = useState({
    marketId: "",
    name: "",
    balance: 0
  })

  const [notification, setNotification] = useState<{
    id: number, 
    message: string,
    type: string
  } | null>(null)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.currentTarget

    setData((prev) => ({
      ...prev,
      [name]: value
    }))
    console.log(data)
  }

  useEffect(() => {
    async function getWallet() {
      if(edit && walletId) {
        try {
          const res = await api.get(`/wallet/${walletId}`)

          const data: WalletType = res.data.data
          console.log(data)
          setData({
            marketId: String(data.market.id),
            name: data.market.name,
            balance: data.balance
          })

        } catch (e: unknown) {
          if(axios.isAxiosError(e)) {
            console.log(e)
            setNotification({
              id: Date.now(),
              message: e.response?.data?.message,
              type: "error"
            })
          }
        }
      }
    }

    async function getAvailableMarkets() {
      if(!edit) {
        try {
          const res = await api.get("/market/available")

          setAvailMarkets(res.data.data)
        } catch (e: unknown) {
          if(axios.isAxiosError(e)) {
            console.log(e)
            setNotification({
              id: Date.now(),
              message: e.response?.data?.message,
              type: "error"
            })
          }
        }
      }
    }

    getWallet()
    getAvailableMarkets()
  }, [edit])

  async function handleSubmit(e: React.FormEvent<HTMLElement>) {
    e.preventDefault()

    
    try {
      let res
      
      if(edit && walletId) {
        const body = {
          balance: data.balance
        }
        res = await api.patch(`/wallet/update/${walletId}`, body) 
      } else {
        const body = {
          balance: data.balance,
          marketId: data.marketId
        }
        res = await api.post("/wallet/create", body)
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

  return (
    <div className="">
      <h2 className="page-header">{edit ? "Edit" : "Create"} Wallet</h2>

      <form onSubmit={handleSubmit} className="wallet-form-container">

        {!edit ? (

          <div className="input-rel">
          <label htmlFor="marketId">Select Market</label>
          <select id="marketId"
            className="input-field"
            name="marketId"
            value={data.marketId}
            onChange={handleInput}
            >
            {availMarkets.map((avM) => (
              <option key={avM.id} value={avM.id}>
                {avM.name}
              </option>
            ))}
          </select>
        </div>
          ) : (
            <div className="market-name-container">
              <p className="market-name">{data.name}</p>
            </div>
          )}
        <div className="input-rel">
          <input id="balance"
            className="input-field"
            name="balance"
            type="text"
            placeholder=" "
            maxLength={20}
            value={data.balance || ""}
            onChange={handleInput}
          />
          <label className="input-label" htmlFor="name">Wallet Balance</label>
        </div>

        <button className="btn-default success-btn" type="submit">
          {edit ? "Edit" : "Create"} Wallet
        </button>
      </form>
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

export default WalletForm
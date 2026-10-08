import React, {useEffect, useState} from "react"
import { api } from "../api/axios"
import DashboardOverall from "../components/dashboardInfo/DashOverall" 
import DashboardMarket from "../components/dashboardInfo/DashMarket"
import DashboardMonth from "../components/dashboardInfo/DashMonth"
import DashboardFlow from "../components/dashboardInfo/DashFlow"
import type { Dashboard } from "../types/dashboard.types"
import "../styles/dashboard/dashMain.css"

function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [period, setPeriods] = useState(() => {
    const params = new URLSearchParams(window.location.search)

    return {
      from: params.get("from"),
      to: params.get("to")
    }
  })

  
  async function getAllStats() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams()

    if(period.from) {
      params.set("from", period.from) 
    }
    if(period.to) {
      params.set("to", period.to)
    }

    url.search = params.toString()
    window.history.replaceState({}, "", url)

    try {
      const res = await api.get("/dashboard/", {
        params: {
          from: period.from,
          to: period.to
        }
      })
      setData(res.data.data)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getAllStats()
  }, [period])

  if(!data) {
    return (
      <div>
        <h2>Loading...</h2>
      </div>
    )
  }

  function handlePeriods(e: React.ChangeEvent<HTMLInputElement>) {
    const {name, value} = e.currentTarget
    setPeriods((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Work Dashboard</h2>
        <div className="filter-period-container">
          <label htmlFor="period-filter-start">Pick Day:</label>
          <input id="period-filter-start" type="date" name="from" value={period.from ?? ""} onChange={handlePeriods}/>
          <label htmlFor="period-filter-end">Range Day:</label>
          <input id="period-filter-end" type="date" name="to" value={period.to ?? ""}  onChange={handlePeriods}/>
        </div>
      </header>

      <section className="dashboard-section">
        {<DashboardOverall data={data.overall}/>}
      </section>
      
      <section className="dashboard-section">
        <h2>Months</h2>
        <div className="month-list">
          {Object.entries(data.months).map(([date, month]) => (
            <DashboardMonth 
            key={date}
            date={date}
            month={month}
            />
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Markets</h2>
        <div className="market-list">
          {data.markets.map((market) => (
            <DashboardMarket key={market.marketId} data={market}/>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Flow</h2>
        <div className="flow-list">
          {Object.entries(data.flow).map(([market, data]) => (
            <DashboardFlow 
            key={market}
            market={market}
            data={data}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
import type { DashFlow } from "../../types/dashboard.types";
import "../../styles/dashboard/dashFlow.css"

type DashFlowProps = {
  market: string,
  data: DashFlow
}

function DashboardFlow({market, data}: DashFlowProps) {
  return (
    <div className="flow-stats">
      <div className="main-flow">
        <h2 className="header-stats">{market}</h2>
        <p>Purchased: <strong className="danger-color">{Number(data.purchased).toFixed(2)}$</strong></p>
        <p>Items: {data.count}</p>
      </div>

      <div className="flow-line"></div>

      <div className="child-flow-container">
        {Object.entries(data.markets).map(([market, data]) => (
          <div key={market} className="child-flow">
            <p className="cf-market-name">{market.toLowerCase()}</p>
            <p>sales: <strong className="success-color">{Number(data.sales).toFixed(2)}$</strong></p>
            <p><strong>{data.count}</strong> items</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardFlow
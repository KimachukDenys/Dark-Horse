import type { DashMarket } from "../../types/dashboard.types";
import { profitColorCheck } from "../../utils/color";
import "../../styles/dashboard/dashMarkets.css"

type DashMarketProps = {
  data: DashMarket
}

function DashboardMarket({data}: DashMarketProps) {
  const color = profitColorCheck(Number(data.netFlow))


  return (
    <section className="market-stats">
      <div className="market-header">
        <h2 className="header-stats">{data.marketName}</h2>
          <p>Balance: <strong>{parseFloat(data.balance).toFixed(2)}$</strong></p>
      </div>
      
      <div className="line"></div>

      <div className="market-info">
        <div className="market-highlight">
          <p>Net: <strong className={`${color}`}>{Number(data.netFlow).toFixed(2)}$</strong></p>
        </div>
        <div className="market-highlight">
          <p>Open Capital: <strong>{Number(data.openCapital).toFixed(2)}$</strong></p>
        </div>
        <div className="market-highlight">
          <p>Items open: <strong>{data.openCapitalCount}</strong></p>
        </div>
      </div>

      <div className="line"></div>

      <div className="market-stats-info">
        <div className="movement-stats">
          <div className="market-highlight">
            <p>Purchased: <strong className="danger-color">{Number(data.purchased).toFixed(2)}$</strong></p>
          </div>
          <p>AVG <strong>{parseFloat(data.purchasedAvg).toFixed(2)}$</strong></p>
          <p><strong>{data.purchasedCount}</strong> items</p>
        </div>
        <div className="movement-stats">
          <div className="market-highlight">
            <p>Sales: <strong className="success-color">{Number(data.sales).toFixed(2)}$</strong></p>
          </div>
          <p>AVG <strong>{parseFloat(data.salesAvg).toFixed(2)}$</strong></p>
          <p><strong>{data.salesCount}</strong> items</p>
        </div>
      </div>
    </section>
  )
}

export default DashboardMarket
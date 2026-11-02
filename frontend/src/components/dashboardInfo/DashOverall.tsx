import type { DashOverall } from "../../types/dashboard.types"
import "../../styles/dashboard/dashOverall.css"

type OverallProps = {
  data: DashOverall
}

function DashboardOverall({data}: OverallProps) {

  return (
    <section className="overall-stats">
      <div className="overall-main">
        <div className="stat-highlight">
          <span>Profit</span>
          <strong>{Number(data.profit).toFixed(2)}$</strong>
        </div>

        <div className="stat-highlight">
          <p>ROI</p>
          <strong>{parseFloat(data.roi).toFixed(2)}%</strong>
        </div>
      </div>

      <div className="overall-cards">
        <div className="stat-card">
          <h3>Purchased</h3>

          <strong className="danger-color">{Number(data.purchased).toFixed(2)}$</strong>

          <div className="stat-details">
            <span>
              AVG
              <b>{parseFloat(data.purchasedAvg).toFixed(2)}</b>
            </span>

            <span>
              Count
              <b>{data.purchasedCount}</b>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Sales</h3>

          <strong className="success-color">{Number(data.sales).toFixed(2)}$</strong>

          <div className="stat-details">
            <span>
              AVG
              <b>{data.salesAvg}</b>
            </span>

            <span>
              Count
              <b>{data.salesCount}</b>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <h3>Open Capital</h3>

          <strong>{Number(data.openCapital).toFixed(2)}$</strong>

          <div className="stat-details">
            <span>
              Items
              <b>{data.openCapitalCount}</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardOverall
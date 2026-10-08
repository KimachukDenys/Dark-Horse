import { formatDate } from "../../utils/date";
import type { DashMonth } from "../../types/dashboard.types";
import "../../styles/dashboard/dashMonth.css"
import { profitColorCheck } from "../../utils/color";

type DashMonthProps = {
  date: string,
  month: DashMonth
}

function DashboardMonth({date, month}: DashMonthProps) {
  const formatedDate = formatDate(date)
  const amountColor = profitColorCheck(Number(month.amount))
  
  return (
    <div className="month-stats">
      <h2>{formatedDate.month} {formatedDate.year}</h2>
      <p>Amount: <span className={amountColor}>{month.amount}</span></p>
    </div>
  )
}

export default DashboardMonth
import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import type { TransactionType } from "../../types/transaction.types";
import TransactionDateGroup from "../../components/cards/TransactionDateGroup";
import TransactionFilter from "../../components/filter/TransacitonFilter";
import Notification from "../../components/notification/Notification";
import "../../styles/transaction/mainTxStyles.css"
import { formatDate } from "../../utils/date";


function TransactionPage() {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);

  const [filter, setFilter] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    return {
      search: params.get("search"),
      type: params.get("type"),
      walletId: params.get("walletId"),
      tradeAble: params.get("tradeAble"),
      itemStatus: params.get("itemStatus"), 
      // orderBy: {}
      from: params.get("from"),
      to: params.get("to")
    }
  })
  
  const [notification, setNotification] = useState<{
    id: number;
    message: string;
    type: "success" | "warning" | "error";
  } | null>(null);

  async function filterItems() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    if(filter.search) {
      params.set("search",filter.search)
    }

    if(filter.type) {
      params.set("type", filter.type)
    }

    if(filter.tradeAble) {
      params.set("tradeAble", filter.tradeAble)
    }

    if(filter.itemStatus) {
      params.set("itemStatus", filter.itemStatus)
    }

    if(filter.walletId) {
      params.set("walletId", filter.walletId)
    }

    if(filter.from) {
      params.set("from", filter.from)
    }

    if(filter.to) {
      params.set("to", filter.to)
    }

    
    url.search = params.toString()
    window.history.replaceState({}, "", url)

    try {
      const res = await api.get(`/transaction/?${params}`)
      setTransactions(res.data.data);
      console.log(res)
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    filterItems()
  }, [filter])

  const handleFilter = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFilter((prev) => ({
      ...prev,
      [name]: prev[name as keyof typeof prev] === value ? "" : value,
    }))
  }

  const groupedTransactions = transactions.reduce(
    (groups, tx) => {
      const formattedDate = formatDate(tx.acquiredAt)
      const date = formattedDate.date 

      if (!groups[date]) {
        groups[date] = {
          transactions: [],
          buyQuantity: 0
        };
      }

      groups[date].transactions.push(tx);

      if(tx.type === "BUY") {
        groups[date].buyQuantity += tx.quantity
      }
      return groups;
    },
    {} as Record<string, {transactions: TransactionType[], buyQuantity: number}>
  );
  
  return (
    <div className="transaction-container">
      <TransactionFilter filter={filter} onChange={handleFilter}/>
      <div className="cards-container">
        <div className="page-header-container">
          <h2 className="page-header">Transactions</h2>
          <div className="filter-date-container">
            <label htmlFor="date-filter-start">Pick Day:</label>
            <input id="date-filter-start" type="date" name="from" value={filter.from ?? ""} onChange={handleFilter}/>
            <label htmlFor="date-filter-end">Range Day:</label>
            <input id="date-filter-end" type="date" name="to" value={filter.to ?? ""}  onChange={handleFilter}/>
          </div>
        </div>
        {
          Object.entries(groupedTransactions).map(
            ([date, group]) => (
              <TransactionDateGroup key={date}
                date={date}
                buyQuantity={group.buyQuantity}
                transactions={group.transactions}
                filterItems={filterItems}
                setNotification={setNotification} />
            )
          )
        }
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
  );
}

export default TransactionPage;
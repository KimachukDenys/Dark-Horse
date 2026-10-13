import React, { useEffect, useState } from "react"
import type { FilterTxType } from "../../types/transaction.types";
import "../../styles/transaction/txFilterStyle.css"
import { api } from "../../api/axios";
import type { MarketType } from "../../types/market.types";

type TransacitonFilterProps = {
  filter: FilterTxType;
  onChange: (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => void;
}


function TransactionFilter( { filter, onChange }: TransacitonFilterProps) {

  const [markets, setMarkets] = useState<MarketType[]>([])
  
  useEffect(() => {
    async function getMarkets() {
      try {
        const res = await api.get("/market/")
        
        setMarkets(res.data.data)
      } catch (e) {
        console.log(e)
      }
    } 
    getMarkets()


  }, [])
  return(
    <div className="transaction-filter">
      <div className="filter-search-container input-rel">
        <input id="filter-search" className="input-field" placeholder=" " name="search" type="text" value={filter.search ?? ""} onChange={onChange} />
        <label className="input-label" htmlFor="filter-search">Search</label>
      </div>

      <div className="filter-body-container">
        <h2 className="filter-select-header">Markets</h2>
        <div className="filter-select-container">
          {markets.map((m) => (
            <button key={m.id} name="marketId"
            className={`action-btn btn-default ${filter.marketId === `${m.id}` ? "active-action" : ""}`}
            value={m.id}
            onClick={onChange}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-body-container">
        <h2 className="filter-select-header">Tradeable:</h2>
        <div className="filter-select-container">
          <button name="tradeAble"
            className={`action-btn btn-default ${!filter.tradeAble ? "active-action" : ""}`}
            value={undefined}
            onClick={onChange}
          >
            All
          </button>
          <button name="tradeAble"
            className={`action-btn btn-default ${filter.tradeAble === "AVAILABLE" ? "active-action" : ""}`}
            value={"AVAILABLE"}
            onClick={onChange}
          >
            Available
          </button>
          <button name="tradeAble"
            className={`action-btn btn-default ${filter.tradeAble === "TRADELOCK" ? "active-action" : ""}`}
            value={"TRADELOCK"}
            onClick={onChange}
          >
            Trade Locked
          </button>
        </div>
      </div>

      <div className="filter-body-container">
        <h2 className="filter-select-header">Transaction Type:</h2>
        <div className="filter-tx-type">
          <button name="type"
            className={`action-btn btn-default ${!filter.type ? "active-action" : ""}`}
            value={undefined}
            onClick={onChange}
          >
            All
          </button>
          <button name="type"
            className={`action-btn btn-default ${filter.type === "BUY" ? "active-action" : ""}`}
            value={"BUY"}
            onClick={onChange}
          >
            Buy
          </button>
          <button name="type"
            className={`action-btn btn-default ${filter.type === "SELL" ? "active-action" : ""}`}
            value={"SELL"}
            onClick={onChange}
          >
            Sell
          </button>        
        </div>
      </div>

      
      <div className="filter-body-container">
        <h2 className="filter-select-header">Item Status</h2>
        <div className="filter-select-container">
          <button name="itemStatus" 
            className={`action-btn btn-default ${filter.itemStatus === "PENDING" ? "active-action" : ""}`} 
            value={"PENDING"}
            onClick={onChange}
          >
            Pending
          </button>
          <button name="itemStatus"
            className={`action-btn btn-default ${filter.itemStatus === "LISTING" ? "active-action" : ""}`} 
            value={"LISTING"}
            onClick={onChange}
          >
            Listing
          </button>
          <button name="itemStatus"
            className={`action-btn btn-default ${filter.itemStatus === "SOLD" ? "active-action" : ""}`} 
            value={"SOLD"}
            onClick={onChange}
          >
            Sold
          </button>
          <button name="itemStatus"
            className={`action-btn btn-default ${filter.itemStatus === "INVENTORY" ? "active-action" : ""}`} 
            value={"INVENTORY"}
            onClick={onChange}
          >
            Inventory
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionFilter
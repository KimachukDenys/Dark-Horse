import React from "react"
import type { FilterTxType } from "../../types/transaction.types";
import { useWallet } from "../../hooks/wallet.context";
import "../../styles/transaction/txFilterStyle.css"

type TransacitonFilterProps = {
  filter: FilterTxType;
  onChange: (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => void;
}


function TransactionFilter( { filter, onChange }: TransacitonFilterProps) {

  const {wallets} = useWallet()
  
  return(
    <div className="transaction-filter">
      <div className="filter-search-container input-rel">
        <input id="filter-search" className="input-field" placeholder=" " name="search" type="text" value={filter.search ?? ""} onChange={onChange} />
        <label className="input-label" htmlFor="filter-search">Search</label>
      </div>

      <div className="filter-body-container">
        <h2 className="filter-select-header">Wallets</h2>
        <div className="filter-select-container">
          {wallets.map((w) => (
            <button key={w.id} name="walletId"
            className={`action-btn btn-default ${filter.walletId === `${w.id}` ? "active-action" : ""}`}
            value={w.id}
            onClick={onChange}
            >
              {w.market.name}
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
            className={`action-btn btn-default ${filter.tradeAble === "TRADELOCK" ? "active-action" : ""}`}
            value={"TRADELOCK"}
            onClick={onChange}
          >
            Trade Locked
          </button>
          <button name="tradeAble"
            className={`action-btn btn-default ${filter.tradeAble === "AVAILABLE" ? "active-action" : ""}`}
            value={"AVAILABLE"}
            onClick={onChange}
          >
            Available
          </button>
          <button name="tradeAble"
            className={`action-btn btn-default ${filter.tradeAble === "POSSIBLE" ? "active-action" : ""}`}
            value={"POSSIBLE"}
            onClick={onChange}
          >
            Possible
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
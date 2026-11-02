import type { TransactionType } from "../../types/transaction.types";
import type { Notification } from "../../types/global.types";
import { formatDate } from "../../utils/date";
import { exteriorColor, exteriorCut, exteriorTypes } from "../../types/transaction.types";
import { generateSteamItemLink, generateCSFloatItemLink} from "../../utils/itemLink";
import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import { useWallet } from "../../hooks/wallet.context";
import type React from "react";
import axios from "axios";
import "../../styles/transaction/txCardStyles.css";


type TransactionCardProps = {
  tx: TransactionType;
  onDelete: () => void;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
};

function TransactionCard({ tx, onDelete, setNotification }: TransactionCardProps) {
  const {getWallets} = useWallet()

  const formatted = formatDate(tx.acquiredAt)
  const quality = tx.item.quality
  const exterior = tx.item.exterior

  //Links
  const linkSteam = generateSteamItemLink(quality, tx.item.name, exterior)
  const linkCSFloat = generateCSFloatItemLink(tx.item.name)
  
  const borColor = {
    borderColor: `${tx.type === "BUY" ? "var(--accent-border)" : "var(--accent-red)"}`
  }

  const exteriorFontColor = {
    color: `${exteriorColor[exterior]}`
  }

  const qualCol = tx.item.itemColor;
  const qualBackColors = {
    boxShadow: `0px -5px 20px 35px #${qualCol}`,
    background: `#${qualCol}`
  }

  let tradeStatus: {name: string, color: string}

  const tradeBanDate = new Date(tx.tradeBanUntil)
  const dayBeforeTl = new Date(tx.tradeBanUntil)
  dayBeforeTl.setDate(dayBeforeTl.getDate() - 1)
  const now = new Date()
  
  if(now < dayBeforeTl) {
    tradeStatus = {
      name: "Trade Lock",
      color: "var(--accent-red)"
    }
  } else if(tradeBanDate > now ) {
    tradeStatus = {
      name: "Possible Available",
      color: "var(--warning)"
    }
  } else {
    tradeStatus = {
      name: "Available",
      color: "var(--accent-border)"
    }
  }

  async function deleteTransaction() {
    try {
      await api.delete(`/transaction/delete/${tx.id}`)
      setNotification({
        id: Date.now(),
        message: `Transaction #${tx.id} deleted successfully`,
        type: "success",
      })
      onDelete()
      getWallets()
    } catch (e: unknown) {
      if(axios.isAxiosError(e)) {

        console.log(e)
        setNotification({
          id: Date.now(),
          message: `${e.response?.data?.message} #${tx.id}`,
          type: "error",
        })
      }
    }
  }

  function renderImage() {
    if(tx.item.imageUrl) {
      const url = `https://community.akamai.steamstatic.com/economy/image/${tx.item.imageUrl}`
      return (
        <img src={url} alt={tx.item.name} className="item-img"/>
      )
    }
    return (
      <p>image</p>
    )
  }

  const exteriorFormat = exteriorCut[exterior]
  let name = tx.item.name
  if(exteriorFormat) {
    name = name.substring(0, name.length - (exterior.length + 2))
  }

  return (
    <div key={tx.id} className="transaction-card" style={borColor}>

      <div className="transaction-header">
        <div className="tx-link-container">
          <Link to={`/transactions/trade/${tx.id}`} className="info-link">#{tx.id}</Link>
          <div className="status-indecator" style={{background: `${tradeStatus.color}`}}></div>
          <p>{tradeStatus.name}</p>
        </div>
        {tx.type === "SELL" && (
          <div className="tx-source-info">
            <p className="">Source #{tx.sourceBuyId}</p>
            <p>ROI: {Number(tx.roi).toFixed(2)}%</p>
          </div>
        )}
        <p className={`${tx.type === "BUY" ? "success-color" : "danger-color"}`}>{tx.type}</p>
      </div>

      <div className="line" style={borColor}></div>

      <div className="transaction-body">

        <div className="transaction-image">
          <div  className="image-back-shadow" style={qualBackColors}></div>
          {renderImage()}
        </div>

        <div className="transaction-info">
          <p className="item-name">
            {exteriorTypes.includes(exterior) && (
              <span className="item-exterior" style={exteriorFontColor}>[{exteriorFormat}]</span>
            )}
            <span>{name}{" "}</span>
            <strong className="tx-card-price">({Number(tx.price).toFixed(2)}$)</strong>
          </p>
          <p>Market: {tx.wallet.market.name}</p>
          <p>Qty: {tx.quantity}</p>
          <p>Status: {tx.itemStatus}</p>
          <p>Date: {formatted.time}  {formatted.date}</p>
        </div>
      </div>

      <div className="transaction-actions">
        <div className="tx-links">
          <a href={linkSteam} target="_blank">Steam</a>
          <a href={linkCSFloat} target="_blank">CSFloat</a>
        </div>
        <div className="action-buttons">
          <Link className="action-btn btn-default" to={`/same-transaction/${tx.id}`}>
            Same
          </Link>
          {
            tx.type !== "SELL" && tx.itemStatus !== "SOLD" && (
              <Link
                className="success-btn btn-default"
                to={`/sell-transaction/${tx.id}`}
              >
                Sell
              </Link>
            )
          }
          <Link className="warning-btn btn-default" to={`/edit-transaction/${tx.id}`}>
            Edit
          </Link>
          <button className="danger-btn btn-default" onClick={deleteTransaction}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionCard
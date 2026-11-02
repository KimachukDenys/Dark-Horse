import { Link } from "react-router-dom";
import { useWallet } from "../hooks/wallet.context";
import MarketCard from "../components/cards/WalletCard";
import Notification from "../components/notification/Notification";
import { useState } from "react";
import "../styles/wallet/walletMain.css"

function WalletPage() {
  const {wallets, getWallets} = useWallet()
  const [notification, setNotification] = useState<{
    id: number,
    message: string,
    type: "success" | "warning" | "error"
  } | null>(null)


  return (
    <div className="wallet-page-container">
      <div className="header-container">
        <h2 className="page-header">Wallets Page</h2>
        <Link className="btn-default success-btn" to={"/create-wallet"}>
          Create Market
        </Link>
      </div>
      <div className="wallets-container">
        {wallets && wallets.map(wallet => (
          <MarketCard key={wallet.id} wallet={wallet} onChange={getWallets} setNotification={setNotification}/>
        ))}
      </div>
      {notification &&
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      }
    </div>
  )
}

export default WalletPage
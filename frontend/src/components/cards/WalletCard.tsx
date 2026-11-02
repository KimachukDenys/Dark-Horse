import type { WalletType } from "../../types/wallet.types";
import type { Notification } from "../../types/global.types";
import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import axios from "axios";
import "../../styles/wallet/walletCard.css"

type WalletProps = {
  wallet: WalletType;
  onChange: () => void;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}

function WalletCard({wallet, onChange, setNotification}: WalletProps) {
  async function deleteWallet() {
    try {
      await api.delete(`/wallet/delete/${wallet.id}`)
      
      onChange()
      setNotification({
        id: Date.now(),
        message: "Wallet deleted successfully",
        type: "success"
      })
    } catch (e: unknown) {
      if(axios.isAxiosError(e)) {
        console.log(e)
        setNotification({
          id: Date.now(),
          message: e.response?.data?.message,
          type: "error"
        })
      }
    }
  }

  return (
    <div className="wallet-card">
      <div className="wallet-info">
        <p className="wallet-id">{wallet.id}</p>
        <p>{wallet.market.name}</p>
        <strong className="wallet-wallet-balance">{Number(wallet.balance).toFixed(2)}$</strong>
      </div>
      <div className="wallet-action-container">
        <Link className="btn-default warning-btn" to={`/edit-wallet/${wallet.id}`}>Edit</Link>
        <button className="btn-default danger-btn" type="button" onClick={deleteWallet}>Delete</button>
      </div>
    </div>
  )
}

export default WalletCard
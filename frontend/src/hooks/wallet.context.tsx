import { createContext, useContext, useEffect, useState } from "react";
import type { WalletType } from "../types/wallet.types";
import { api } from "../api/axios";
import type { MarketType } from "../types/market.types";

type WalletContextType = {
  wallets: WalletType[];
  markets: MarketType[];
  invest: number;
  getWallets: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [markets, setMarkets] = useState<MarketType[]>([]);
  const [invest, setInvest] = useState(0)

  async function getWallets() {
    try {
      const resWallets = await api.get("/wallet/");

      setWallets(resWallets.data.data);
      setMarkets(resWallets.data.data.market)

      const resInvest = await api.get("/transaction/get-inventory")
      setInvest(Number(resInvest.data.data.allInvest))
    } catch (e: unknown) {
      console.error(e);
    }
  }

  useEffect(() => {
    getWallets();
  }, []);

  return (
    <WalletContext.Provider value={{wallets, markets, invest, getWallets}}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useMarket must be used within MarketContextProvider");
  }

  return context;
};
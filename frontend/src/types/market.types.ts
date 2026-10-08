export type MarketType = {
  id: number;
  name: string;

  wallet: {
    id:number;
    balance: number;
    currency: ("USD" | "EUR" | "UAH");
  }
}

export const MarketName: Record<string, string> = {
  "CSFLOAT": "CSFloat",
  "STEAM": "Steam",
  "DMarket": "DMarket",
  "SKINPORT": "SkinPort",
  "TRADEIT": "TradeIT" 
}
export type MarketType = {
  id: number;
  name: string;
  hashName: string;
}

export const MARKET_NAMES = [
  "Steam",
  "CSFloat",
  "DMarket",
  "SkinPort",
  "CSMoney",
  "TradeIT",
] as const;

export type MarketName = (typeof MARKET_NAMES)[number];
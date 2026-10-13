export type MarketType = {
  id: number;
  name: string;

  wallet: {
    id:number;
    balance: number;
    currency: ("USD" | "EUR" | "UAH");
  }
}
export type WalletType = {
  id: number;
  balance: number;
  currency: ("USD" | "EUR" | "UAH");

  market: {
    id: number;
    name: string;
    hashName: string;
  }
}
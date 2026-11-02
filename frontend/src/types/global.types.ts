export type Notification = {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
};

export const currencyRate: Record<string, number> = {
  "USD": 1,
  "UAH": 44.62,
  "EUR": 0.87
}
import { Decimal } from "@prisma/client/runtime/library"
import { CurrencyName } from "@prisma/client"

export function currencyCheck(amount: Decimal, txCurrency: CurrencyName) {
  const currencyData: Record<string, number> = {
    USD: 1,
    UAH: 44.62,
    EUR: 0.87
  }

  return amount.div(currencyData[txCurrency])
}
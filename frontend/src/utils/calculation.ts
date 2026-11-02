import { currencyRate } from "../types/global.types"

export function calculation(value: string) {
  
  if(value.includes("*")) {
    const [price, quantity] = value.split("*")
    const newPrice = Number(price) * Number(quantity)
    
    return { newPrice, quantity }
  }
  
  if(value.includes("+")) {
    const values = value.split("+")
    const quantity = values.length
    const newPrice = values.reduce((sum, item) => 
      sum + Number(item), 0)
    return { newPrice, quantity }
  }
  
  const newPrice = Number(value)
  const quantity = 1
  return {newPrice, quantity}
}

export function currencyCalculation(price: number, buyPrice: number, itemCurrency: string, oldCurrency?: string) {
  let roi = ((price - buyPrice) / buyPrice * 100)
  
  if(oldCurrency && (oldCurrency !== itemCurrency || itemCurrency !== "USD")) {
    const toDolar = currencyRate[oldCurrency]
    price = price / toDolar
    roi = ((price - buyPrice) / buyPrice * 100)
  }
  
  const curConvert = currencyRate[itemCurrency]
  price = (price * curConvert)
  
  return {price, roi}
}
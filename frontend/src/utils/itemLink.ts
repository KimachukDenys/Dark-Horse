import { specialTypes, wearTypes, steamWearSearch, steamSpecialSearch } from "../types/transaction.types";
import { getKeyByValue } from "../utils/findValue";


// Steam Link
export function generateSteamItemLink(special: string, name: string, wear: string, ) {
  if(wear === "NONE") {
    return `https://steamcommunity.com/market/listings/730/${name}`
  }
  const specialFormat = getKeyByValue(specialTypes, special)
  const wearFormat = getKeyByValue(wearTypes, wear)
  
  const specialSearch = steamSpecialSearch[special as keyof typeof steamSpecialSearch]
  const wearSearch = steamWearSearch[wear as keyof typeof steamWearSearch]
  
  
  const itemName = `${encodeURIComponent(`${specialFormat ? specialFormat + " " : ""}${name} (${wearFormat})`)}`
  const linkFormat = `${itemName}?category_Exterior=${wearSearch}&category_Quality=${specialSearch}`
  return `https://steamcommunity.com/market/listings/730/${linkFormat}`
}


// CSFloat link
export function generateCSFloatItemLink(special: string, name: string, wear: string) {
  if(wear === "NONE") {
    return `https://csfloat.com/search?market_hash_name=${name}`
  }
  const specialFormat = getKeyByValue(specialTypes, special)
  const wearFormat = getKeyByValue(wearTypes, wear)

  const linkFormat = `${encodeURIComponent(`${specialFormat ? specialFormat + " " : ""}${name} (${wearFormat})`)}`
  return `https://csfloat.com/search?market_hash_name=${linkFormat}`
}
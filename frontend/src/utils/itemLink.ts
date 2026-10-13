import { steamExteriorSearch, steamSpecialSearch } from "../types/transaction.types";


// Steam Link
export function generateSteamItemLink(special: string, name: string, exterior: string | undefined) {
  if(!exterior) {
    return `https://steamcommunity.com/market/listings/730/${name}`
  }

  
  const specialSearch = steamSpecialSearch[special]
  const exteriorSearch = steamExteriorSearch[exterior]
  

  const linkFormat = `${encodeURIComponent(`${name}`)}?category_Exterior=${exteriorSearch}&category_Quality=${specialSearch}`
  return `https://steamcommunity.com/market/listings/730/${linkFormat}`
}


// CSFloat link
export function generateCSFloatItemLink(name: string) {
  return `https://csfloat.com/search?market_hash_name=${encodeURIComponent(`${name}`)}`
}
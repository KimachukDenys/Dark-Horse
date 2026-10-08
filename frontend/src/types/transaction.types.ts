// Transaction DTO

export type TransactionType = {
  id: number;
  special: ("NORMAL" | "SOUVENIR" | "STATTRAK");
  wear: ("FN" | "MW" | "FT" | "WW" | "BS" | "NONE");
  floatValue: number;
  price: number;
  type: ("BUY" | "SELL");
  quantity: number;
  itemStatus: ("PENDING" | "INVENTORY" | "LISTING" | "SOLD");
  itemCurrency: ("USD" | "EUR" | "UAH");

  csFloatId?: string;
  steamAssetId?: string;
  steamInstanceId?: string;
  steamClassId?: string;

  roi: number | 0;
  sourceBuyId?: number;
  marketId: number;
  acquiredAt: string;
  tradeBanUntil: string;
  createdAt: string;
  updatedAt: string;
  
  
  item: {
    id: number;
    name: string;
    imageUrl: string;
    itemType: string;
    itemCollection: string;
    itemQuality: string;
  };
  market: {
    name: string
  }
};

export type FilterTxType = {
  search: string | null;
  marketId: string | null;
  tradeAble: string | null;
  type: string | null;
  itemStatus: string | null;
}

export const specialTypes: Record<string, string>  = {
  "StatTrak™": "STATTRAK",
  "StatTrak": "STATTRAK",
  "Souvenir": "SOUVENIR"
};

export const wearTypes: Record<string, string> = {
  "Factory New": "FN",
  "Minimal Wear": "MW",
  "Field-Tested": "FT",
  "Well-Worn": "WW",
  "Battle-Scarred": "BS",
};

export const floatValues: Record<string, number> = {
  "FN": 0.06,
  "MW": 0.14,
  "FT": 0.25,
  "WW": 0.41,
  "BS": 0.67,
  "NONE": 0
}






// Steam Search props
export const steamWearSearch: Record<string, string> = {
  FN: "WearCategory0",
  MW: "WearCategory1",
  FT: "WearCategory2",
  WW: "WearCategory3",
  BS: "WearCategory4",
  NONE: ""
}

export const steamSpecialSearch: Record<string, string>= {
  NORMAL: "normal",
  STATTRAK: "strange",
  SOUVENIR: "tournament",
}



// colors
export const wearColor: Record<string, string> = {
  FN: "var(--fn-color)",
  MW: "var(--mw-color)",
  FT: "var(--ft-color)",
  WW: "var(--ww-color)",
  BS: "var(--bs-color)",
  NONE: "var(--classifield)",
}

export const qualityColors: Record<string, string> = {
  "Consumer Grade": "var(--consumer-grade)",
  "Industrial Grade": "var(--industrial-grade)",
  "Mil-Spec Grade": "var(--mil-spec)",
  "Restricted": "var(--restricted)",
  "Classified": "var(--classifield)",
  "Covert": "var(--covert)",
  "Contraband": "var(--contraband)"
}
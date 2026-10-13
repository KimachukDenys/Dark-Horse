// Transaction DTO

export type TransactionType = {
  id: number;

  floatValue: number;
  price: number;
  type: ("BUY" | "SELL");
  quantity: number;
  itemStatus: ("PENDING" | "INVENTORY" | "LISTING" | "SOLD");
  itemCurrency: ("USD" | "EUR" | "UAH");

  csFloatId?: string;
  steamAssetId?: string;
  steamInstanceId?: string;

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
    marketHashName: string
    marketBucketGroupId:       string;
    imageUrl:      string;
    itemColor:     string;
    backgroundColor:    string;
    classId:   string;
    appId:   number;

    itemType: string;
    itemTypeIterName: string;
 
    weaponType: string;
    weaponTypeIterName: string;
 
    collection: string;
    collectionIterName: string;
 
    quality: string;
    qualityIterName: string;
 
    rarity: string;
    rarityItrName: string;
 
    exterior: string;
    exteriorIterName: string;
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

export const qualityTypes: Array<string>  = ["StatTrak™", "Souvenir"];

export const exteriorTypes: Array<string> = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"]

export const floatValues: Record<string, number> = {
  "Factory New": 0.06,
  "Minimal Wear": 0.14,
  "Field-Tested": 0.25,
  "Well-Worn": 0.41,
  "Battle-Scarred": 0.67,
}

export const exteriorCut: Record<string, string> = {
  "Factory New": "FN",
  "Minimal Wear": "MW",
  "Field-Tested": "FT",
  "Well-Worn": "WW",
  "Battle-Scarred": "BS",
}


// Steam Search props
export const steamExteriorSearch: Record<string, string> = {
  "Factory New": "WearCategory0",
  "Minimal Wear": "WearCategory1",
  "Field-Tested": "WearCategory2",
  "Well-Worn": "WearCategory3",
  "Battle-Scarred": "WearCategory4",
}

export const steamSpecialSearch: Record<string, string>= {
  "Normal": "normal",
  "StatTrak™": "strange",
  "Souvenir": "tournament",
}



// colors
export const exteriorColor: Record<string, string> = {
  "Factory New": "var(--fn-color)", 
  "Minimal Wear": "var(--mw-color)",
  "Field-Tested": "var(--ft-color)",
  "Well-Worn": "var(--ww-color)",
  "Battle-Scarred": "var(--bs-color)",
  "NONE": "var(--classifield)",
}
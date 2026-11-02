import { Wear, TransactionType, Status, CurrencyName } from "@prisma/client";


export type ItemTypesData = {
  id?: number, 
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
 
  itemCollection: string;
  itemCollectionIterName: string;
 
  itemQuality: string;
  itemQualityIterName: string;
 
  itemRarity: string;
  itemRarityItrName: string;
 
  itemExterior: string;
  itemExteriorIterName: string;
};


export type TransactionData = {
  id?: number;
  wear: Wear;
  floatValue: number;
  price: number;
  type: TransactionType;
  quantity: number;
  itemStatus: Status;
  itemCurrency: CurrencyName;

  csFloatId?: string;
  steamAssetId?: string;
  steamInstanceId?: string;
  steamClassId?: string;
  
  roi?: number;
  sourceBuyId?: number;
  walletId: number;
  
  acquiredAt: Date;
};

export type CreateTransactionDTO = {
  item: ItemTypesData;
  transaction: TransactionData;
};

export type UpdateTransactionDTO = {
  item: ItemTypesData;
  transaction: TransactionData;
};

export type filterTransactionDTO = {
  search?: string;
  type?: TransactionType;
  walletId?: number;
  itemStatus?: Status; 
  tradeAble?: string;
  orderBy?: {}
  from?: string;
  to?: string; 
}


export const wearTypes: Record<string, string> = {
  "FN": "Factory New",
  "MW": "Minimal Wear",
  "FT": "Field-Tested",
  "WW": "Well-Worn",
  "BS": "Battle-Scarred",
  "NONE": ""
}

export const wearCategory: Record<string, string> = {
  "FN": "WearCategory0",
  "MW": "WearCategory1",
  "FT": "WearCategory2",
  "WW": "WearCategory3",
  "BS": "WearCategory4",
  "NONE": ""
}
import { SpecialType, Wear, TransactionType, Status, Currency } from "@prisma/client";


export type TransactionData = {
  id?: number;
  special: SpecialType;
  wear: Wear;
  floatValue: number;
  price: number;
  type: TransactionType;
  quantity: number;
  itemStatus: Status;
  itemCurrency: Currency;

  csFloatId?: string;
  steamAssetId?: string;
  steamInstanceId?: string;
  steamClassId?: string;
  
  roi?: number;
  sourceBuyId?: number;
  marketId: number;
  
  acquiredAt: Date;
};

export type CreateTransactionDTO = {
  item: {
    name: string;
  };
  transaction: TransactionData;
};

export type UpdateTransactionDTO = {
  item: {
    id: number;
    name: string;
  };
  transaction: TransactionData;
};

export type filterTransactionDTO = {
  search?: string;
  type?: TransactionType;
  marketId?: number;
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

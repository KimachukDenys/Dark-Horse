import { SpecialType, Wear, TransactionType, Status, Currency } from "@prisma/client";


export type TransactionData = {
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

  marketId: number;
  itemId?: number
};

export type CreateTransactionDTO = {
  item: {
    name: string;
  };
  transaction: TransactionData;
};

export type UpdateTransactionDTO = {
  item: {
    name: string;
  };
  transaction: TransactionData;
};
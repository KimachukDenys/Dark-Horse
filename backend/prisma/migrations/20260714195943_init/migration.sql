-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'UAH', 'EUR');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "Wear" AS ENUM ('FN', 'MW', 'FT', 'WW', 'BS');

-- CreateEnum
CREATE TYPE "SpecialType" AS ENUM ('NORMAL', 'STATTRAK', 'SOUVENIR');

-- CreateTable
CREATE TABLE "Market" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" SERIAL NOT NULL,
    "balance" DECIMAL(18,6) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "marketId" INTEGER NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTransaction" (
    "id" SERIAL NOT NULL,
    "special" "SpecialType" NOT NULL DEFAULT 'NORMAL',
    "wear" "Wear" NOT NULL DEFAULT 'FN',
    "floatValue" DECIMAL(18,14) NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'BUY',
    "quantity" INTEGER NOT NULL,
    "csFloatId" TEXT,
    "steamAssetId" TEXT,
    "steamInstanceId" TEXT,
    "steamClassId" TEXT,
    "marketId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "targetInvestment" DECIMAL(18,2) NOT NULL,
    "targetReturn" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalTransaction" (
    "id" SERIAL NOT NULL,
    "goalId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "GoalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_marketId_key" ON "Wallet"("marketId");

-- CreateIndex
CREATE UNIQUE INDEX "GoalTransaction_goalId_transactionId_key" ON "GoalTransaction"("goalId", "transactionId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTransaction" ADD CONSTRAINT "ItemTransaction_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTransaction" ADD CONSTRAINT "ItemTransaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalTransaction" ADD CONSTRAINT "GoalTransaction_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalTransaction" ADD CONSTRAINT "GoalTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "ItemTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

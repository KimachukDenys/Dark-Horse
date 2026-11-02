/*
  Warnings:

  - You are about to drop the column `sourceMarketId` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `targetMarketId` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `marketId` on the `ItemTransaction` table. All the data in the column will be lost.
  - The `itemCurrency` column on the `ItemTransaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,6)` to `Decimal(18,14)`.
  - The `currency` column on the `Wallet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[hashName]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceWalletId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetWalletId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `GoalTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ItemTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `walletId` to the `ItemTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashName` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CurrencyName" AS ENUM ('USD', 'UAH', 'EUR');

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_sourceMarketId_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_targetMarketId_fkey";

-- DropForeignKey
ALTER TABLE "ItemTransaction" DROP CONSTRAINT "ItemTransaction_marketId_fkey";

-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "sourceMarketId",
DROP COLUMN "targetMarketId",
ADD COLUMN     "sourceWalletId" INTEGER NOT NULL,
ADD COLUMN     "targetWalletId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "GoalTransaction" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ItemTransaction" DROP COLUMN "marketId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "walletId" INTEGER NOT NULL,
DROP COLUMN "itemCurrency",
ADD COLUMN     "itemCurrency" "CurrencyName" NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "hashName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "steamUserId" INTEGER,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(18,14),
DROP COLUMN "currency",
ADD COLUMN     "currency" "CurrencyName" NOT NULL DEFAULT 'USD';

-- DropEnum
DROP TYPE "Currency";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "currencyRate" INTEGER NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_name_key" ON "Currency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Market_hashName_key" ON "Market"("hashName");

-- AddForeignKey
ALTER TABLE "ItemTransaction" ADD CONSTRAINT "ItemTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTransaction" ADD CONSTRAINT "ItemTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_sourceWalletId_fkey" FOREIGN KEY ("sourceWalletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_targetWalletId_fkey" FOREIGN KEY ("targetWalletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalTransaction" ADD CONSTRAINT "GoalTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

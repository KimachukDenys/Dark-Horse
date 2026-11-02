/*
  Warnings:

  - You are about to alter the column `targetInvestment` on the `Goal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Decimal(18,8)`.
  - You are about to alter the column `targetReturn` on the `Goal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Decimal(18,8)`.
  - You are about to alter the column `targetReceive` on the `Goal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Decimal(18,8)`.
  - You are about to alter the column `targetSpend` on the `Goal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Decimal(18,8)`.

*/
-- AlterTable
ALTER TABLE "Goal" ALTER COLUMN "targetInvestment" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "targetReturn" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "targetReceive" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "targetSpend" SET DATA TYPE DECIMAL(18,8);

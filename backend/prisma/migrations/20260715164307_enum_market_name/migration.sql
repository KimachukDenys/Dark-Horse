/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `Market` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MarketName" AS ENUM ('STEAM', 'CSFLOAT', 'DMARKET', 'SKINPORT', 'CSMONEY', 'TRADEIT');

-- AlterTable
ALTER TABLE "Market" DROP COLUMN "name",
ADD COLUMN     "name" "MarketName" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Market_name_key" ON "Market"("name");

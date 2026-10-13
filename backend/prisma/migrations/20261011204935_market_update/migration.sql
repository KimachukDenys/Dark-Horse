/*
  Warnings:

  - Changed the type of `name` on the `Market` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Market" DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropEnum
DROP TYPE "MarketName";

-- CreateIndex
CREATE UNIQUE INDEX "Market_name_key" ON "Market"("name");

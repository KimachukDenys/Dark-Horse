/*
  Warnings:

  - You are about to drop the column `special` on the `ItemTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `steamClassId` on the `ItemTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `wear` on the `ItemTransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[marketHashName]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `marketHashName` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "appId" INTEGER,
ADD COLUMN     "backgroundColor" TEXT,
ADD COLUMN     "classId" TEXT,
ADD COLUMN     "itemCollectionIterName" TEXT,
ADD COLUMN     "itemColor" TEXT,
ADD COLUMN     "itemExterior" TEXT,
ADD COLUMN     "itemExteriorIterName" TEXT,
ADD COLUMN     "itemQualityIterName" TEXT,
ADD COLUMN     "itemRarity" TEXT,
ADD COLUMN     "itemRarityItrName" TEXT,
ADD COLUMN     "itemTypeIterName" TEXT,
ADD COLUMN     "marketBucketGroupId" TEXT,
ADD COLUMN     "marketHashName" TEXT NOT NULL,
ADD COLUMN     "weaponTypeIterName" TEXT;

-- AlterTable
ALTER TABLE "ItemTransaction" DROP COLUMN "special",
DROP COLUMN "steamClassId",
DROP COLUMN "wear";

-- DropEnum
DROP TYPE "SpecialType";

-- CreateIndex
CREATE UNIQUE INDEX "Item_marketHashName_key" ON "Item"("marketHashName");

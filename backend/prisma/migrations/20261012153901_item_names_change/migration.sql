/*
  Warnings:

  - You are about to drop the column `itemCollection` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemCollectionIterName` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemExterior` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemExteriorIterName` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemQuality` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemQualityIterName` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemRarity` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `itemRarityItrName` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "itemCollection",
DROP COLUMN "itemCollectionIterName",
DROP COLUMN "itemExterior",
DROP COLUMN "itemExteriorIterName",
DROP COLUMN "itemQuality",
DROP COLUMN "itemQualityIterName",
DROP COLUMN "itemRarity",
DROP COLUMN "itemRarityItrName",
ADD COLUMN     "collection" TEXT,
ADD COLUMN     "collectionIterName" TEXT,
ADD COLUMN     "exterior" TEXT,
ADD COLUMN     "exteriorIterName" TEXT,
ADD COLUMN     "quality" TEXT,
ADD COLUMN     "qualityIterName" TEXT,
ADD COLUMN     "rarity" TEXT,
ADD COLUMN     "rarityIterName" TEXT;

/*
  Warnings:

  - Made the column `acquiredAt` on table `ItemTransaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tradeBanUntil` on table `ItemTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ItemTransaction" ALTER COLUMN "acquiredAt" SET NOT NULL,
ALTER COLUMN "tradeBanUntil" SET NOT NULL;

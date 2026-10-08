/*
  Warnings:

  - Made the column `targetReceive` on table `Goal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Goal" ALTER COLUMN "targetReturn" DROP NOT NULL,
ALTER COLUMN "targetReceive" SET NOT NULL;

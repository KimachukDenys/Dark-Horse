/*
  Warnings:

  - You are about to drop the column `userId` on the `GoalTransaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GoalTransaction" DROP CONSTRAINT "GoalTransaction_userId_fkey";

-- AlterTable
ALTER TABLE "GoalTransaction" DROP COLUMN "userId";

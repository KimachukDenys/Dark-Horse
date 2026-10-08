/*
  Warnings:

  - Added the required column `sourceMarketId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetMarketId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetReceive` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetSpend` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('QUEUED', 'ACTIVE', 'COMPLETED', 'CANCELED');

-- DropForeignKey
ALTER TABLE "GoalTransaction" DROP CONSTRAINT "GoalTransaction_goalId_fkey";

-- DropForeignKey
ALTER TABLE "GoalTransaction" DROP CONSTRAINT "GoalTransaction_transactionId_fkey";

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "sourceMarketId" INTEGER NOT NULL,
ADD COLUMN     "status" "GoalStatus" NOT NULL DEFAULT 'QUEUED',
ADD COLUMN     "targetMarketId" INTEGER NOT NULL,
ADD COLUMN     "targetReceive" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "targetSpend" DECIMAL(18,2) NOT NULL;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_sourceMarketId_fkey" FOREIGN KEY ("sourceMarketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_targetMarketId_fkey" FOREIGN KEY ("targetMarketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalTransaction" ADD CONSTRAINT "GoalTransaction_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalTransaction" ADD CONSTRAINT "GoalTransaction_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "ItemTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

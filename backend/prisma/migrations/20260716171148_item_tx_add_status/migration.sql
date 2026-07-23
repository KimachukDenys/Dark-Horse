-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'INVENTORY', 'LISTING', 'SOLD');

-- AlterTable
ALTER TABLE "ItemTransaction" ADD COLUMN     "itemStatus" "Status" NOT NULL DEFAULT 'PENDING';

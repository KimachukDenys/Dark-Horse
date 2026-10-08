-- AlterTable
ALTER TABLE "ItemTransaction" ADD COLUMN     "sourceBuyId" INTEGER;

-- AddForeignKey
ALTER TABLE "ItemTransaction" ADD CONSTRAINT "ItemTransaction_sourceBuyId_fkey" FOREIGN KEY ("sourceBuyId") REFERENCES "ItemTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

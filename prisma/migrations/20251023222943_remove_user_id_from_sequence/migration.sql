/*
  Warnings:

  - You are about to drop the column `userId` on the `Sequence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeId,entity]` on the table `Sequence` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Sequence_userId_entity_key";

-- AlterTable
ALTER TABLE "Sequence" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Sequence_storeId_entity_key" ON "Sequence"("storeId", "entity");

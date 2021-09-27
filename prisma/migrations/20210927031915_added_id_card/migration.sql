/*
  Warnings:

  - A unique constraint covering the columns `[idCard]` on the table `StudentInfomation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "StudentInfomation" ADD COLUMN     "idCard" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "StudentInfomation_idCard_key" ON "StudentInfomation"("idCard");

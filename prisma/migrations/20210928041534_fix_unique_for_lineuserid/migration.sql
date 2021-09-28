/*
  Warnings:

  - A unique constraint covering the columns `[lineUserId]` on the table `StudentInfomation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudentInfomation_lineUserId_key" ON "StudentInfomation"("lineUserId");

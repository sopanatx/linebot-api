/*
  Warnings:

  - You are about to drop the `LineLogin` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teacherId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "teacherId",
ADD COLUMN     "teacherId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "LineLogin";

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

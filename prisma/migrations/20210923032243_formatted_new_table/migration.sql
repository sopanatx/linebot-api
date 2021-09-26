/*
  Warnings:

  - You are about to drop the column `addedAt` on the `StudentInfomation` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `StudentInfomation` table. All the data in the column will be lost.
  - You are about to drop the column `isLoggedIn` on the `StudentInfomation` table. All the data in the column will be lost.
  - You are about to drop the column `lineUserId` on the `StudentInfomation` table. All the data in the column will be lost.
  - You are about to drop the column `studentType` on the `StudentInfomation` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `teacherName` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `ScheduleSent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[idCardNo]` on the table `StudentInfomation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idCardNo` to the `StudentInfomation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectName` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentGrade" ADD COLUMN     "gradeType" TEXT;

-- AlterTable
ALTER TABLE "StudentInfomation" DROP COLUMN "addedAt",
DROP COLUMN "birthDate",
DROP COLUMN "isLoggedIn",
DROP COLUMN "lineUserId",
DROP COLUMN "studentType",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idCardNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "name",
DROP COLUMN "teacherName",
ADD COLUMN     "subjectName" TEXT NOT NULL;

-- DropTable
DROP TABLE "ScheduleSent";

-- CreateTable
CREATE TABLE "LineLogin" (
    "id" TEXT NOT NULL,
    "idCard" TEXT NOT NULL,
    "lineUserId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentInfomation_idCardNo_key" ON "StudentInfomation"("idCardNo");

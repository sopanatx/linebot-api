/*
  Warnings:

  - You are about to drop the column `addedAt` on the `StudentGrade` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentGrade" DROP COLUMN "addedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ClassJoined" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "hasOverAbsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassJoined_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAutoSend" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timeToSend" TIMESTAMP(3) NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAutoSend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoPublish" (
    "id" TEXT NOT NULL,
    "timeToPublish" TIMESTAMP(3) NOT NULL,
    "semester" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutoPublish_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentGrade" ADD CONSTRAINT "StudentGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentInfomation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassJoined" ADD CONSTRAINT "ClassJoined_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentInfomation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassJoined" ADD CONSTRAINT "ClassJoined_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

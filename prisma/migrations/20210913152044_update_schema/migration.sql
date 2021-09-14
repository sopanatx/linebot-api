/*
  Warnings:

  - You are about to drop the `AutoSendMessages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LineUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "StudentInfomation" ADD COLUMN     "birthDate" INTEGER,
ADD COLUMN     "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lineUserId" TEXT;

-- DropTable
DROP TABLE "AutoSendMessages";

-- DropTable
DROP TABLE "LineUsers";

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleSent" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "topic" TEXT,
    "lineuserId" TEXT NOT NULL,
    "sentBy" TEXT,
    "hasSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "ScheduleSent_pkey" PRIMARY KEY ("id")
);

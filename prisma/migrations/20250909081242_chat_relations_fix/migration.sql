/*
  Warnings:

  - You are about to drop the column `blocker` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `fromUser` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `moodCtx` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `toUser` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `adultCtx` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `lastActiveAt` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `userA` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `userB` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `fromUser` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `matchId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `MoodSession` table. All the data in the column will be lost.
  - You are about to drop the column `boundaries` on the `MoodSession` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `MoodSession` table. All the data in the column will be lost.
  - You are about to drop the column `intent` on the `MoodSession` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `MoodSession` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reporter` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `birthdate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reputation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[byId,targetId]` on the table `Block` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fromId,toId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userAId,userBId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `byId` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetId` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userBId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mood` on the `MoodSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `byId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SwipeAction" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('NORMAL', 'SERIOUS', 'FUN', 'HOT');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'LOCATION', 'SYSTEM', 'CALL');

-- DropForeignKey
ALTER TABLE "MoodSession" DROP CONSTRAINT "MoodSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reputation" DROP CONSTRAINT "Reputation_userId_fkey";

-- DropIndex
DROP INDEX "Like_fromUser_toUser_idx";

-- DropIndex
DROP INDEX "Like_toUser_idx";

-- DropIndex
DROP INDEX "Match_userA_idx";

-- DropIndex
DROP INDEX "Match_userB_idx";

-- DropIndex
DROP INDEX "Message_matchId_createdAt_idx";

-- DropIndex
DROP INDEX "MoodSession_mood_active_idx";

-- DropIndex
DROP INDEX "MoodSession_userId_active_idx";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "blocker",
DROP COLUMN "target",
ADD COLUMN     "byId" TEXT NOT NULL,
ADD COLUMN     "targetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "fromUser",
DROP COLUMN "moodCtx",
DROP COLUMN "toUser",
ADD COLUMN     "fromId" TEXT NOT NULL,
ADD COLUMN     "toId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "adultCtx",
DROP COLUMN "lastActiveAt",
DROP COLUMN "userA",
DROP COLUMN "userB",
ADD COLUMN     "userAId" TEXT NOT NULL,
ADD COLUMN     "userBId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content",
DROP COLUMN "fromUser",
DROP COLUMN "matchId",
DROP COLUMN "type",
ADD COLUMN     "chatId" TEXT,
ADD COLUMN     "conversationId" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MoodSession" DROP COLUMN "active",
DROP COLUMN "boundaries",
DROP COLUMN "expiresAt",
DROP COLUMN "intent",
DROP COLUMN "startedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "mood",
ADD COLUMN     "mood" "Mood" NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "details",
DROP COLUMN "reporter",
DROP COLUMN "target",
ADD COLUMN     "byId" TEXT NOT NULL,
ADD COLUMN     "targetId" TEXT NOT NULL,
ALTER COLUMN "reason" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthdate",
DROP COLUMN "role",
DROP COLUMN "username",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "lastActiveAt" TIMESTAMP(6),
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "ReportDetail";

-- DropTable
DROP TABLE "Reputation";

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredGenders" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minAge" INTEGER NOT NULL DEFAULT 18,
    "maxAge" INTEGER NOT NULL DEFAULT 60,
    "distanceKm" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Swipe" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "action" "SwipeAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowPhoto" BOOLEAN NOT NULL DEFAULT false,
    "allowLocation" BOOLEAN NOT NULL DEFAULT false,
    "allowVideoCall" BOOLEAN NOT NULL DEFAULT false,
    "allowVoiceCall" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Preference_userId_key" ON "Preference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Swipe_fromId_toId_key" ON "Swipe"("fromId", "toId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userAId_userBId_key" ON "Conversation"("userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_matchId_key" ON "Chat"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Consent_chatId_userId_key" ON "Consent"("chatId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_byId_targetId_key" ON "Block"("byId", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_fromId_toId_key" ON "Like"("fromId", "toId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_userAId_userBId_key" ON "Match"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_byId_fkey" FOREIGN KEY ("byId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_byId_fkey" FOREIGN KEY ("byId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodSession" ADD CONSTRAINT "MoodSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

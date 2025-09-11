-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpCode_userId_code_idx" ON "OtpCode"("userId", "code");

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ReportDetail" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "messageId" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportDetail_targetUserId_idx" ON "ReportDetail"("targetUserId");

-- CreateIndex
CREATE INDEX "ReportDetail_messageId_idx" ON "ReportDetail"("messageId");

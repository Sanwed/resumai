-- CreateTable
CREATE TABLE "token-purchase" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token-purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token-purchase_stripeEventId_key" ON "token-purchase"("stripeEventId");

-- CreateIndex
CREATE UNIQUE INDEX "token-purchase_stripePaymentIntentId_key" ON "token-purchase"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "token-purchase_userId_createdAt_idx" ON "token-purchase"("userId", "createdAt");

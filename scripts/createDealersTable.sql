-- CreateTable
CREATE TABLE IF NOT EXISTS "Dealer" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT,
    "telephone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Dealer_country_idx" ON "Dealer"("country");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Dealer_company_idx" ON "Dealer"("company");

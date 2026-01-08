-- CreateTable
CREATE TABLE IF NOT EXISTS "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "image" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Event_order_idx" ON "Event"("order");


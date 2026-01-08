-- Add interiorMainImage column to Model table
ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "interiorMainImage" TEXT;


-- CreateEnum
CREATE TYPE "CommodityType" AS ENUM (
  'OIL',
  'LNG',
  'LPG',
  'REFINED_PRODUCTS',
  'PETROCHEMICALS',
  'CONTAINER',
  'BULK'
);

-- AlterTable
ALTER TABLE "Ship" ADD COLUMN "commodity" "CommodityType" NOT NULL DEFAULT 'OIL';
ALTER TABLE "Ship" ADD COLUMN "cargoVolume" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Backfill commodity from legacy vessel cargo category
UPDATE "Ship"
SET
  "commodity" = CASE "cargoType"::text
    WHEN 'LNG' THEN 'LNG'::"CommodityType"
    WHEN 'CONTAINER' THEN 'CONTAINER'::"CommodityType"
    WHEN 'BULK' THEN 'BULK'::"CommodityType"
    WHEN 'OIL' THEN 'OIL'::"CommodityType"
    WHEN 'OTHER' THEN 'PETROCHEMICALS'::"CommodityType"
    ELSE 'OIL'::"CommodityType"
  END;

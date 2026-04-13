-- Re-point EnergyPrice observations to shared CommodityType (GAS legacy → LNG).

ALTER TABLE "EnergyPrice" ADD COLUMN "type_new" "CommodityType";

UPDATE "EnergyPrice" SET "type_new" = CASE
  WHEN "type"::text = 'OIL' THEN 'OIL'::"CommodityType"
  WHEN "type"::text = 'GAS' THEN 'LNG'::"CommodityType"
  ELSE 'OIL'::"CommodityType"
END;

ALTER TABLE "EnergyPrice" DROP COLUMN "type";
ALTER TABLE "EnergyPrice" RENAME COLUMN "type_new" TO "type";

DROP TYPE "EnergyPriceType";

-- AlterTable
ALTER TABLE "Ship" ADD COLUMN "latitude" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Ship" ADD COLUMN "longitude" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Ship" ADD COLUMN "originCountry" TEXT NOT NULL DEFAULT 'Unknown';
ALTER TABLE "Ship" ADD COLUMN "destinationCountry" TEXT NOT NULL DEFAULT 'Unknown';
ALTER TABLE "Ship" ADD COLUMN "ownerCompany" TEXT NOT NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE "SupplyChainEvent" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "SupplyChainEvent" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "SupplyChainEvent" ADD COLUMN "region" TEXT;

-- CreateIndex
CREATE INDEX "Ship_latitude_longitude_idx" ON "Ship"("latitude", "longitude");

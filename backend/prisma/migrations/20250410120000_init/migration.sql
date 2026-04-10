-- CreateEnum
CREATE TYPE "CargoType" AS ENUM ('OIL', 'LNG', 'CONTAINER', 'BULK', 'OTHER');

-- CreateEnum
CREATE TYPE "ShipStatus" AS ENUM ('MOVING', 'WAITING', 'BLOCKED', 'DELAYED');

-- CreateEnum
CREATE TYPE "SupplyChainEventType" AS ENUM ('DELAY', 'INCIDENT', 'REROUTE', 'CLEARANCE');

-- CreateEnum
CREATE TYPE "EnergyPriceType" AS ENUM ('OIL', 'GAS');

-- CreateTable
CREATE TABLE "Ship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imo" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "cargoType" "CargoType" NOT NULL,
    "capacity" DECIMAL(20,2) NOT NULL,
    "currentStatus" "ShipStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipRouteLeg" (
    "id" TEXT NOT NULL,
    "shipId" TEXT NOT NULL,
    "originPort" TEXT NOT NULL,
    "destinationPort" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "estimatedArrival" TIMESTAMP(3) NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "ShipRouteLeg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyChainEvent" (
    "id" TEXT NOT NULL,
    "shipId" TEXT NOT NULL,
    "routeLegId" TEXT,
    "type" "SupplyChainEventType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "SupplyChainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyPrice" (
    "id" TEXT NOT NULL,
    "type" "EnergyPriceType" NOT NULL,
    "value" DECIMAL(20,4) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ship_imo_key" ON "Ship"("imo");

-- CreateIndex
CREATE INDEX "Ship_currentStatus_idx" ON "Ship"("currentStatus");

-- CreateIndex
CREATE INDEX "Ship_cargoType_idx" ON "Ship"("cargoType");

-- CreateIndex
CREATE INDEX "ShipRouteLeg_shipId_closedAt_idx" ON "ShipRouteLeg"("shipId", "closedAt");

-- CreateIndex
CREATE INDEX "ShipRouteLeg_shipId_sequence_idx" ON "ShipRouteLeg"("shipId", "sequence");

-- CreateIndex
CREATE INDEX "ShipRouteLeg_originPort_destinationPort_idx" ON "ShipRouteLeg"("originPort", "destinationPort");

-- CreateIndex
CREATE UNIQUE INDEX "ShipRouteLeg_shipId_sequence_key" ON "ShipRouteLeg"("shipId", "sequence");

-- CreateIndex
CREATE INDEX "SupplyChainEvent_shipId_timestamp_idx" ON "SupplyChainEvent"("shipId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "SupplyChainEvent_timestamp_idx" ON "SupplyChainEvent"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "EnergyPrice_type_timestamp_idx" ON "EnergyPrice"("type", "timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_url_key" ON "NewsItem"("url");

-- CreateIndex
CREATE INDEX "NewsItem_timestamp_idx" ON "NewsItem"("timestamp" DESC);

-- AddForeignKey
ALTER TABLE "ShipRouteLeg" ADD CONSTRAINT "ShipRouteLeg_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_routeLegId_fkey" FOREIGN KEY ("routeLegId") REFERENCES "ShipRouteLeg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

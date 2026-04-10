const { PrismaClient, CargoType, ShipStatus, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

/** Deterministic synthetic fleet; upserted by `imo` so re-runs are safe (idempotent). */
function buildShipSeeds() {
  const countries = [
    'NO',
    'SG',
    'US',
    'DE',
    'JP',
    'KR',
    'CN',
    'GR',
    'NL',
    'DK',
    'GB',
    'IT',
    'AE',
    'BR',
    'CA',
  ];
  const cargoRotation = [
    CargoType.LNG,
    CargoType.CONTAINER,
    CargoType.OIL,
    CargoType.BULK,
    CargoType.OTHER,
    CargoType.LNG,
    CargoType.CONTAINER,
  ];
  const statusRotation = [
    ShipStatus.MOVING,
    ShipStatus.WAITING,
    ShipStatus.MOVING,
    ShipStatus.BLOCKED,
    ShipStatus.DELAYED,
    ShipStatus.WAITING,
  ];
  const count = 42;
  const seeds = [];
  for (let i = 0; i < count; i += 1) {
    const n = i + 1;
    seeds.push({
      name: `MV Seed Runner ${String(n).padStart(2, '0')}`,
      imo: String(9100000 + n),
      country: countries[i % countries.length],
      cargoType: cargoRotation[i % cargoRotation.length],
      capacity: new Prisma.Decimal(String(8000 + i * 1375.5)),
      currentStatus: statusRotation[i % statusRotation.length],
    });
  }
  return seeds;
}

async function main() {
  const seeds = buildShipSeeds();
  for (const s of seeds) {
    await prisma.ship.upsert({
      where: { imo: s.imo },
      create: s,
      update: {
        name: s.name,
        country: s.country,
        cargoType: s.cargoType,
        capacity: s.capacity,
        currentStatus: s.currentStatus,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });

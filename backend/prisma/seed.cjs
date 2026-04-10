const { PrismaClient, CargoType, ShipStatus, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

const CLUSTERS = {
  hormuz: { baseLat: 26.28, baseLng: 56.35, spread: 0.45 },
  med: { baseLat: 36.2, baseLng: 19.5, spread: 2.2 },
  indian: { baseLat: 6.5, baseLng: 74.0, spread: 6.0 },
};

const ROUTES = [
  {
    cluster: 'hormuz',
    origin: 'United Arab Emirates',
    destination: 'India',
    registry: 'AE',
  },
  {
    cluster: 'hormuz',
    origin: 'Oman',
    destination: 'Japan',
    registry: 'OM',
  },
  {
    cluster: 'hormuz',
    origin: 'Qatar',
    destination: 'South Korea',
    registry: 'QA',
  },
  {
    cluster: 'hormuz',
    origin: 'Kuwait',
    destination: 'Singapore',
    registry: 'KW',
  },
  {
    cluster: 'med',
    origin: 'Greece',
    destination: 'Egypt',
    registry: 'GR',
  },
  {
    cluster: 'med',
    origin: 'Italy',
    destination: 'Turkey',
    registry: 'IT',
  },
  {
    cluster: 'med',
    origin: 'Spain',
    destination: 'France',
    registry: 'ES',
  },
  {
    cluster: 'indian',
    origin: 'India',
    destination: 'Singapore',
    registry: 'IN',
  },
  {
    cluster: 'indian',
    origin: 'Indonesia',
    destination: 'China',
    registry: 'ID',
  },
  {
    cluster: 'indian',
    origin: 'Malaysia',
    destination: 'United Arab Emirates',
    registry: 'MY',
  },
];

const OWNERS = [
  'Maersk A/S',
  'Mediterranean Shipping Company',
  'COSCO Shipping Lines',
  'CMA CGM',
  'NYK Line',
  'Evergreen Marine',
  'Hapag-Lloyd AG',
  'Ocean Network Express',
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

function positionInCluster(clusterKey, index) {
  const c = CLUSTERS[clusterKey];
  const t = index * 1.17;
  return {
    latitude: c.baseLat + Math.sin(t) * c.spread * 0.9,
    longitude: c.baseLng + Math.cos(t * 0.83) * c.spread * 0.9,
  };
}

/** Deterministic synthetic fleet; upserted by `imo` so re-runs are safe (idempotent). */
function buildShipSeeds() {
  const count = 42;
  const seeds = [];
  for (let i = 0; i < count; i += 1) {
    const n = i + 1;
    const route = ROUTES[i % ROUTES.length];
    const { latitude, longitude } = positionInCluster(route.cluster, i);
    seeds.push({
      name: `MV Seed Runner ${String(n).padStart(2, '0')}`,
      imo: String(9100000 + n),
      country: route.registry,
      latitude,
      longitude,
      originCountry: route.origin,
      destinationCountry: route.destination,
      ownerCompany: OWNERS[i % OWNERS.length],
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
        latitude: s.latitude,
        longitude: s.longitude,
        originCountry: s.originCountry,
        destinationCountry: s.destinationCountry,
        ownerCompany: s.ownerCompany,
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

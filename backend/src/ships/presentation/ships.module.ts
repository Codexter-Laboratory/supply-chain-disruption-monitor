import { Module } from '@nestjs/common';
import { SHIP_REPOSITORY } from '../application/ship.repository.port';
import { SHIP_WRITE_PORT } from '../application/ship-write.port';
import { ShipApplicationService } from '../application/ship.application.service';
import { PrismaShipRepository } from '../infrastructure/prisma-ship.repository';
import { PrismaShipWriteAdapter } from '../infrastructure/prisma-ship-write.adapter';
import { ShipsResolver } from './ships.resolver';

@Module({
  providers: [
    ShipApplicationService,
    ShipsResolver,
    { provide: SHIP_REPOSITORY, useClass: PrismaShipRepository },
    { provide: SHIP_WRITE_PORT, useClass: PrismaShipWriteAdapter },
  ],
  exports: [ShipApplicationService, SHIP_WRITE_PORT, SHIP_REPOSITORY],
})
export class ShipsModule {}

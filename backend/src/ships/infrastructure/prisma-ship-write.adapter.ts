import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { ShipWritePort } from '../application/ship-write.port';
import type { ShipOperationalStatus } from '../domain/ship.entity';
import { shipOperationalStatusToPrisma } from './ship-status.prisma-map';

@Injectable()
export class PrismaShipWriteAdapter implements ShipWritePort {
  constructor(private readonly prisma: PrismaService) {}

  async updateOperationalStatus(
    shipId: string,
    status: ShipOperationalStatus,
  ): Promise<void> {
    await this.prisma.ship.update({
      where: { id: shipId },
      data: { currentStatus: shipOperationalStatusToPrisma[status] },
    });
  }
}

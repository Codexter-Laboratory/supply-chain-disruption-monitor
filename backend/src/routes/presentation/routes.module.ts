import { Module } from '@nestjs/common';
import { ROUTE_LEG_REPOSITORY } from '../application/route-leg.repository.port';
import { RoutesApplicationService } from '../application/routes.application.service';
import { PrismaRouteLegRepository } from '../infrastructure/prisma-route-leg.repository';
import { RoutesResolver } from './routes.resolver';

@Module({
  providers: [
    RoutesApplicationService,
    RoutesResolver,
    { provide: ROUTE_LEG_REPOSITORY, useClass: PrismaRouteLegRepository },
  ],
  exports: [RoutesApplicationService],
})
export class RoutesModule {}

import { Module } from '@nestjs/common';
import { HealthApplicationService } from '../application/health.application.service';
import { HealthResolver } from './health.resolver';

@Module({
  providers: [HealthApplicationService, HealthResolver],
})
export class HealthModule {}

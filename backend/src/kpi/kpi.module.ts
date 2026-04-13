import { Module } from '@nestjs/common';
import { KpiService } from './application/kpi.service';

@Module({
  providers: [KpiService],
  exports: [KpiService],
})
export class KpiModule {}

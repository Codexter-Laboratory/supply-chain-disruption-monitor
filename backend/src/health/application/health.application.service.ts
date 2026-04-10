import { Injectable } from '@nestjs/common';
import { HEALTH_OK } from '../domain/health.constants';

@Injectable()
export class HealthApplicationService {
  status(): string {
    return HEALTH_OK;
  }
}

import { Query, Resolver } from '@nestjs/graphql';
import { HealthApplicationService } from '../application/health.application.service';

@Resolver()
export class HealthResolver {
  constructor(private readonly healthApp: HealthApplicationService) {}

  @Query(() => String, { name: 'health' })
  health(): string {
    return this.healthApp.status();
  }
}

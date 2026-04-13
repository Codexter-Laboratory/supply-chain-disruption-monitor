import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { RealtimeModule } from './realtime/presentation/realtime.module';
import { ShipsModule } from './ships/presentation/ships.module';
import { RoutesModule } from './routes/presentation/routes.module';
import { EventsModule } from './events/presentation/events.module';
import { PricingModule } from './pricing/presentation/pricing.module';
import { NewsModule } from './news/presentation/news.module';
import { HealthModule } from './health/presentation/health.module';
import { KpiModule } from './kpi/kpi.module';
import { SupplyChainSimulationOrchestrator } from './simulation/supply-chain-simulation.orchestrator';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RealtimeModule,
    HealthModule,
    ShipsModule,
    RoutesModule,
    EventsModule,
    PricingModule,
    NewsModule,
    KpiModule,
  ],
  providers: [SupplyChainSimulationOrchestrator],
})
export class AppModule {}

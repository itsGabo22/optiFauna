import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalsModule } from './animals/animals.module';
import { HealthModule } from './health/health.module';
import { ReproductionModule } from './reproduction/reproduction.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { FinanceModule } from './finance/finance.module';
import { FarmsModule } from './farms/farms.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'optifauna',
      autoLoadEntities: true,
      synchronize: true, // Only for development/structural stage
    }),
    AnimalsModule,
    HealthModule,
    ReproductionModule,
    NutritionModule,
    FinanceModule,
    FarmsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

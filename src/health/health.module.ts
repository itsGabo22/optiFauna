import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { HealthRecord } from './entities/health-record.entity';
import { AnimalsModule } from '../animals/animals.module';

@Module({
  imports: [TypeOrmModule.forFeature([HealthRecord]), AnimalsModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}

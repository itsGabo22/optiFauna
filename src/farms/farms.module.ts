import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsService } from './farms.service';
import { FarmsController } from './farms.controller';
import { Farm } from './entities/farm.entity';
import { FarmWorker } from './entities/farm-worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Farm, FarmWorker])],
  controllers: [FarmsController],
  providers: [FarmsService],
  exports: [FarmsService, TypeOrmModule],
})
export class FarmsModule {}

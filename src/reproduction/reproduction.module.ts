import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReproductionService } from './reproduction.service';
import { ReproductionController } from './reproduction.controller';
import { ReproductionRecord } from './entities/reproduction-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReproductionRecord])],
  controllers: [ReproductionController],
  providers: [ReproductionService],
  exports: [ReproductionService],
})
export class ReproductionModule {}

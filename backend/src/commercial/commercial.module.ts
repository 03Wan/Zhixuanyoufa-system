import { Module } from '@nestjs/common';
import { CommercialController } from './commercial.controller';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [LogsModule],
  controllers: [CommercialController],
})
export class CommercialModule {}

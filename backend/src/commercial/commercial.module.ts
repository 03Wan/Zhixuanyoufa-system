import { Module } from '@nestjs/common';
import { CommercialController } from './commercial.controller';
import { LogsModule } from '../logs/logs.module';
import { CommercialService } from './commercial.service';

@Module({
  imports: [LogsModule],
  controllers: [CommercialController],
  providers: [CommercialService],
})
export class CommercialModule {}

import { Module } from '@nestjs/common';
import { CommercialController } from './commercial.controller';
import { LogsModule } from '../logs/logs.module';
import { CommercialService } from './commercial.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [LogsModule, NotificationsModule],
  controllers: [CommercialController],
  providers: [CommercialService],
})
export class CommercialModule {}

import { Module } from '@nestjs/common';
import { DetectionController } from './detection.controller';
import { DetectionService } from './detection.service';
import { LogsModule } from '../logs/logs.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ModelConfigModule } from '../model-config/model-config.module';

@Module({
  imports: [LogsModule, SubscriptionModule, ModelConfigModule],
  controllers: [DetectionController],
  providers: [DetectionService],
  exports: [DetectionService],
})
export class DetectionModule {}

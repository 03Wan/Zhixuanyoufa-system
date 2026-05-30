import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { DetectionModule } from '../detection/detection.module';

@Module({
  imports: [SubscriptionModule, DetectionModule],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}

import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { LogsModule } from '../logs/logs.module';
import { TaskReportsController } from './task-reports.controller';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [LogsModule, SubscriptionModule],
  controllers: [ReportsController, TaskReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

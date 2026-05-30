import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { LogsModule } from '../logs/logs.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [LogsModule, SubscriptionModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

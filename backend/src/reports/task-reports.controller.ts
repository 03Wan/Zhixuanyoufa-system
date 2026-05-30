import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':taskId/report')
  generate(@CurrentUser('id') userId: string, @Param('taskId') taskId: string) {
    return this.reportsService.generate(userId, taskId);
  }
}

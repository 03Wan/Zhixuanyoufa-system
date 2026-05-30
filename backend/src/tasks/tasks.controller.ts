import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(userId, dto);
  }

  @Post('quota-check')
  quotaCheck(@CurrentUser('id') userId: string) {
    return this.tasksService.quotaCheck(userId);
  }

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('platform') platform?: string,
    @Query('market') market?: string,
    @Query('status') status?: string,
  ) {
    return this.tasksService.list(userId, {
      page: Number(page || 1),
      pageSize: Number(pageSize || 10),
      platform,
      market,
      status,
    });
  }

  @Get(':id')
  detail(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tasksService.detail(userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tasksService.remove(userId, id);
  }

  @Patch(':id/status')
  updateStatus(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.tasksService.updateStatus(userId, id, dto);
  }

  @Post(':id/manual-review')
  manualReview(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { note?: string },
  ) {
    return this.tasksService.requestManualReview(userId, id, body?.note);
  }
}

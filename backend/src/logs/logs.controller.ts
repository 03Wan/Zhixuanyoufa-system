import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
  ) {
    return this.logsService.listLogs({
      page: Number(page || 1),
      pageSize: Number(pageSize || 20),
      action,
      targetType,
    });
  }
}


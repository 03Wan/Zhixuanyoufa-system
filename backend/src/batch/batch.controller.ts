import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BatchService } from './batch.service';
import { CreateBatchTaskDto } from './dto/create-batch-task.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('batch-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'OPERATOR')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  list(@CurrentUser('id') userId: string) { return this.batchService.list(userId); }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateBatchTaskDto) { return this.batchService.create(userId, dto); }

  @Get(':id')
  detail(@CurrentUser('id') userId: string, @Param('id') id: string) { return this.batchService.detail(userId, id); }

  @Post(':id/run')
  run(@CurrentUser('id') userId: string, @Param('id') id: string) { return this.batchService.run(userId, id); }
}

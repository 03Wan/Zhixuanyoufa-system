import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MaterialVersionsService } from './material-versions.service';

@Controller('tasks/:taskId/material-versions')
@UseGuards(JwtAuthGuard)
export class MaterialVersionsController {
  constructor(private readonly materialVersionsService: MaterialVersionsService) {}

  @Get()
  list(@CurrentUser('id') userId: string, @Param('taskId') taskId: string) {
    return this.materialVersionsService.list(userId, taskId);
  }

  @Post()
  snapshot(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() body: { title?: string; sellingPoints?: string; detailText?: string; adText?: string; imageUrls?: string[] },
  ) {
    return this.materialVersionsService.snapshot(userId, taskId, body);
  }
}

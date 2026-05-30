import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DetectionService } from './detection.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  @Post(':taskId/detect')
  run(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() body: { enabled?: boolean; apiUrl?: string; apiKey?: string; modelName?: string },
  ) {
    return this.detectionService.runDetection(userId, taskId, body);
  }

  @Get(':taskId/result')
  result(@CurrentUser('id') userId: string, @Param('taskId') taskId: string) {
    return this.detectionService.getResult(userId, taskId);
  }
}

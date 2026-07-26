import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PublicationOutcomesService } from './publication-outcomes.service';

@Controller('tasks/:taskId/publication-outcome')
@UseGuards(JwtAuthGuard)
export class PublicationOutcomesController {
  constructor(private readonly service: PublicationOutcomesService) {}
  @Get() get(@CurrentUser('id') userId: string, @Param('taskId') taskId: string) { return this.service.get(userId, taskId); }
  @Put() save(@CurrentUser('id') userId: string, @Param('taskId') taskId: string, @Body() body: any) { return this.service.save(userId, taskId, body); }
}

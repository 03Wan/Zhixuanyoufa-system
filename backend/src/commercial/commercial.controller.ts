import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LogsService } from '../logs/logs.service';

@Controller('commercial')
@UseGuards(JwtAuthGuard)
export class CommercialController {
  constructor(private readonly logsService: LogsService) {}

  @Post('apply')
  async apply(
    @CurrentUser('id') userId: string,
    @Body() body: { type?: string; contact?: string; companyName?: string; note?: string },
  ) {
    await this.logsService.createLog({
      userId,
      action: 'COMMERCIAL_APPLY',
      targetType: 'COMMERCIAL',
      targetId: body.type || 'GENERAL',
      detail: body,
    });

    return {
      submitted: true,
      message: '已提交试点申请。当前功能属于商业化阶段规划，团队会线下联系开通。',
    };
  }
}

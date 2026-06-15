import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ModelConfigService } from './model-config.service';

@Controller('model-config')
@UseGuards(JwtAuthGuard)
export class ModelConfigController {
  constructor(private readonly modelConfigService: ModelConfigService) {}

  @Get('me')
  getMine(@CurrentUser('id') userId: string) {
    return this.modelConfigService.getPublicConfig(userId);
  }

  @Patch('me')
  saveMine(
    @CurrentUser('id') userId: string,
    @Body() body: { enabled?: boolean; apiUrl?: string; apiKey?: string; modelName?: string; provider?: string },
  ) {
    return this.modelConfigService.saveConfig(userId, body);
  }
}

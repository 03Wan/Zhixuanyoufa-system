import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubscriptionService } from './subscription.service';
import { SelectSubscriptionDto } from './dto/select-subscription.dto';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getMe(userId);
  }

  @Get('usage')
  usage(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getUsage(userId);
  }

  @Post('select')
  select(@CurrentUser('id') userId: string, @Body() dto: SelectSubscriptionDto) {
    return this.subscriptionService.select(userId, dto);
  }

  @Post('upgrade')
  upgrade(@CurrentUser('id') userId: string, @Body() dto: UpgradeSubscriptionDto) {
    return this.subscriptionService.upgrade(userId, dto);
  }
}

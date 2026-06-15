import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CommercialService } from './commercial.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('commercial')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommercialController {
  constructor(private readonly commercialService: CommercialService) {}

  @Post('apply')
  apply(
    @CurrentUser('id') userId: string,
    @Body() body: { type?: string; contact?: string; companyName?: string; note?: string },
  ) {
    return this.commercialService.apply(userId, body);
  }

  @Get('applications')
  @Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')
  list(@CurrentUser('id') userId: string) {
    return this.commercialService.list(userId);
  }

  @Patch('applications/:id')
  @Roles('SYSTEM_ADMIN')
  approve(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { status: string; reviewNote?: string },
  ) {
    return this.commercialService.approve(userId, id, body);
  }
}

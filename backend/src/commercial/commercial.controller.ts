import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CommercialService } from './commercial.service';

@Controller('commercial')
export class CommercialController {
  constructor(private readonly commercialService: CommercialService) {}

  @Post('apply')
  apply(
    @Body()
    body: {
      type?: string;
      companyName?: string;
      contactName?: string;
      email?: string;
      phone?: string;
      note?: string;
    },
  ) {
    return this.commercialService.applyPublic(body);
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')
  list(@CurrentUser('id') userId: string) {
    return this.commercialService.list(userId);
  }

  @Patch('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  approve(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { status: string; reviewNote?: string },
  ) {
    return this.commercialService.approve(userId, id, body);
  }
}

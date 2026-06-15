import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportTemplatesService } from './report-templates.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('report-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN')
export class ReportTemplatesController {
  constructor(private readonly reportTemplatesService: ReportTemplatesService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.reportTemplatesService.list(userId);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() body: { name: string; code: string; scope?: string; versionNo?: number; schema?: any },
  ) {
    return this.reportTemplatesService.create(userId, body);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; code?: string; scope?: string; versionNo?: number; schema?: any },
  ) {
    return this.reportTemplatesService.update(userId, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reportTemplatesService.remove(userId, id);
  }
}

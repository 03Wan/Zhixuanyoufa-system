import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportTemplatesService } from './report-templates.service';

@Controller('report-templates')
@UseGuards(JwtAuthGuard)
export class ReportTemplatesController {
  constructor(private readonly reportTemplatesService: ReportTemplatesService) {}

  @Get()
  list() { return this.reportTemplatesService.list(); }

  @Post()
  create(@Body() body: { name: string; code: string; scope?: string; versionNo?: number; schema?: any }) {
    return this.reportTemplatesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; code?: string; scope?: string; versionNo?: number; schema?: any }) {
    return this.reportTemplatesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.reportTemplatesService.remove(id); }
}


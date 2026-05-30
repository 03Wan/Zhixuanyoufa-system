import { Body, Controller, Delete, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExportReportDto } from './dto/export-report.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate/:taskId')
  generate(@CurrentUser('id') userId: string, @Param('taskId') taskId: string) {
    return this.reportsService.generate(userId, taskId);
  }

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('platform') platform?: string,
    @Query('market') market?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.reportsService.list(userId, {
      page: Number(page || 1),
      pageSize: Number(pageSize || 10),
      platform,
      market,
      riskLevel,
      keyword,
    });
  }

  @Post('export')
  async export(@CurrentUser('id') userId: string, @Body() dto: ExportReportDto, @Res() res: Response) {
    const file = await this.reportsService.export(userId, dto.taskId, dto.format || 'pdf');
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.content);
  }

  @Get(':id')
  detail(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reportsService.detail(userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reportsService.remove(userId, id);
  }

  @Get(':id/download')
  async download(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.getDownloadPayload(userId, id);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.content);
  }
}

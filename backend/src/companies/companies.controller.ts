import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.companiesService.list(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateCompanyDto) {
    return this.companiesService.create(userId, dto);
  }

  @Get(':id')
  detail(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.companiesService.detail(userId, id);
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: Partial<CreateCompanyDto>) {
    return this.companiesService.update(userId, id, dto);
  }

  @Post(':id/members')
  addMember(@CurrentUser('id') currentUserId: string, @Param('id') id: string, @Body() body: { userId: string; role: string }) {
    return this.companiesService.addMember(currentUserId, id, body.userId, body.role);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.companiesService.remove(userId, id);
  }
}

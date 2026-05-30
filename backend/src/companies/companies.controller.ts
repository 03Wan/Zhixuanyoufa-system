import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  list() { return this.companiesService.list(); }

  @Post()
  create(@Body() dto: CreateCompanyDto) { return this.companiesService.create(dto); }

  @Get(':id')
  detail(@Param('id') id: string) { return this.companiesService.detail(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCompanyDto>) { return this.companiesService.update(id, dto); }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() body: { userId: string; role: string }) {
    return this.companiesService.addMember(id, body.userId, body.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.companiesService.remove(id); }
}


import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RulesService } from './rules.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Controller('rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  create(@Body() dto: CreateRuleDto) {
    return this.rulesService.create(dto);
  }

  @Get()
  list() {
    return this.rulesService.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.rulesService.detail(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.rulesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rulesService.remove(id);
  }

  @Get(':id/versions')
  versions(@Param('id') id: string) {
    return this.rulesService.versions(id);
  }

  @Post(':id/clone-version')
  cloneVersion(@Param('id') id: string, @Body() body: { createdBy?: string; note?: string }) {
    return this.rulesService.cloneVersion(id, body.createdBy, body.note);
  }
}

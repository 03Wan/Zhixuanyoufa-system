import { Body, Controller, Get, Patch, Post, Query, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'OPERATOR')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list(@CurrentUser('id') userId: string, @Query('keyword') keyword?: string, @Query('serviceStatus') serviceStatus?: string) {
    return this.customersService.list(userId, { keyword, serviceStatus });
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: Partial<CreateCustomerDto>) {
    return this.customersService.update(userId, id, dto);
  }
}

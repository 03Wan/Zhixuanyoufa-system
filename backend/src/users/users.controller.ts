import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN')
  list(@CurrentUser('id') userId: string) {
    return this.usersService.listUsers(userId);
  }

  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.usersService.getCurrentUser(userId);
  }

  @Patch('me')
  update(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch(':id')
  @Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN')
  updateUser(
    @CurrentUser('id') currentUserId: string,
    @Param('id') id: string,
    @Body() dto: Partial<UpdateProfileDto & { role?: string }>,
  ) {
    return this.usersService.updateUser(currentUserId, id, dto);
  }

  @Delete(':id')
  @Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN')
  deleteUser(@CurrentUser('id') currentUserId: string, @Param('id') id: string) {
    return this.usersService.deleteUser(currentUserId, id);
  }
}

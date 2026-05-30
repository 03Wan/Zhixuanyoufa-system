import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.listUsers();
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
  updateUser(@Param('id') id: string, @Body() dto: Partial<UpdateProfileDto & { role?: string }>) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}


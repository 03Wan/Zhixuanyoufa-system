import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateMaterialDto } from './dto/create-material.dto';

@Controller('tasks/:taskId/materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateMaterialDto,
  ) {
    return this.materialsService.addMaterial(userId, taskId, dto);
  }

  @Get()
  list(@CurrentUser('id') userId: string, @Param('taskId') taskId: string) {
    return this.materialsService.listMaterials(userId, taskId);
  }
}

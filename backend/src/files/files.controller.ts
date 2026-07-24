import { BadRequestException, Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('taskId') taskId?: string,
  ) {
    if (!file) throw new BadRequestException('请选择要上传的文件');
    return this.filesService.upload(userId, file, taskId);
  }

  @Get()
  list(@CurrentUser('id') userId: string, @Query('taskId') taskId?: string) {
    return this.filesService.list(userId, taskId);
  }
}

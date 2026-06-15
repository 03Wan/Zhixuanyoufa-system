import { Controller, Get, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilesService } from './files.service';

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function resolveUploadDir() {
  return process.env.VERCEL ? '/tmp/uploads' : 'uploads';
}

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = resolveUploadDir();
          try {
            if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
          } catch {}
          cb(null, uploadDir);
        },
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        if (String(file.mimetype).startsWith('image/')) cb(null, true);
        else cb(new Error('仅支持图片文件上传'), false);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(
    @Req() req: Request,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('taskId') taskId?: string,
  ) {
    const origin = `${req.protocol}://${req.get('host')}`;
    const url = new URL(`/uploads/${file.filename}`, origin).toString();
    return this.filesService.saveFileRecord(userId, {
      taskId,
      originalName: safeName(file.originalname),
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      storageProvider: process.env.VERCEL ? 'vercel-tmp' : 'local',
      storagePath: file.path,
      url,
    });
  }

  @Get()
  list(@CurrentUser('id') userId: string, @Query('taskId') taskId?: string) {
    return this.filesService.list(userId, taskId);
  }
}

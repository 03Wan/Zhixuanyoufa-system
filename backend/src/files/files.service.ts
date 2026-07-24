import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type DetectedFile = {
  extension: string;
  mimeType: string;
};

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  private async currentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyId: true, companyName: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  private isPlatformAdmin(role: string) {
    return role === 'SYSTEM_ADMIN' || role === 'ADMIN';
  }

  private detectImage(buffer: Buffer): DetectedFile | null {
    if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { extension: '.jpg', mimeType: 'image/jpeg' };
    }
    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { extension: '.png', mimeType: 'image/png' };
    }
    if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return { extension: '.webp', mimeType: 'image/webp' };
    }
    return null;
  }

  private safeName(name: string) {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 160) || 'upload';
  }

  private extensionOf(name: string) {
    const index = name.lastIndexOf('.');
    return index >= 0 ? name.slice(index).toLowerCase() : '';
  }

  private storageConfig() {
    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
    if (!supabaseUrl || !serviceKey) {
      throw new BadRequestException('文件存储未配置，请联系系统管理员');
    }
    return { supabaseUrl, serviceKey, bucket };
  }

  private async uploadObject(path: string, buffer: Buffer, mimeType: string) {
    const { supabaseUrl, serviceKey, bucket } = this.storageConfig();
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'content-type': mimeType,
        'x-upsert': 'false',
      },
      body: new Uint8Array(buffer),
    });
    if (!response.ok) {
      throw new BadRequestException('文件保存失败，请稍后重试');
    }
    return { supabaseUrl, serviceKey, bucket };
  }

  private async createSignedUrl(path: string) {
    const { supabaseUrl, serviceKey, bucket } = this.storageConfig();
    const response = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
    });
    if (!response.ok) {
      throw new BadRequestException('文件访问链接生成失败，请稍后重试');
    }
    const data = (await response.json()) as { signedURL?: string; signedUrl?: string };
    const signedPath = data.signedURL || data.signedUrl;
    if (!signedPath) throw new BadRequestException('文件访问链接生成失败，请稍后重试');
    return signedPath.startsWith('http') ? signedPath : `${supabaseUrl}/storage/v1${signedPath}`;
  }

  async upload(userId: string, file: Express.Multer.File, taskId?: string) {
    const me = await this.currentUser(userId);
    if (!file.buffer?.length) throw new BadRequestException('文件内容为空');
    if (file.size > MAX_FILE_SIZE_BYTES) throw new BadRequestException('文件大小不能超过 10MB');

    const detected = this.detectImage(file.buffer);
    const declaredExtension = this.extensionOf(file.originalname);
    if (!detected || !ALLOWED_MIME_TYPES.has(detected.mimeType) || !ALLOWED_EXTENSIONS.has(declaredExtension)) {
      throw new BadRequestException('仅支持 JPG、PNG、WebP 图片文件');
    }
    if (declaredExtension === '.jpeg' && detected.extension === '.jpg') {
      detected.extension = '.jpeg';
    }
    if (declaredExtension !== detected.extension) {
      throw new BadRequestException('文件扩展名与内容不一致');
    }

    let companyId = me.companyId;
    if (taskId) {
      const task = await this.prisma.materialTask.findUnique({
        where: { id: taskId },
        select: { id: true, userId: true, companyId: true },
      });
      if (!task) throw new NotFoundException('关联任务不存在');
      if (!this.isPlatformAdmin(me.role) && task.companyId !== me.companyId && task.userId !== userId) {
        throw new ForbiddenException('无权为该任务上传文件');
      }
      companyId = task.companyId || companyId;
    }

    const safeOriginalName = this.safeName(file.originalname);
    const fileName = `${randomUUID()}${detected.extension}`;
    const storagePath = `${companyId || userId}/${new Date().toISOString().slice(0, 10)}/${fileName}`;
    await this.uploadObject(storagePath, file.buffer, detected.mimeType);
    const url = await this.createSignedUrl(storagePath);

    return this.prisma.fileAsset.create({
      data: {
        userId,
        taskId,
        companyId,
        originalName: safeOriginalName,
        fileName,
        mimeType: detected.mimeType,
        size: file.size,
        storageProvider: 'supabase-storage',
        storagePath,
        url,
      },
    });
  }

  async list(userId: string, taskId?: string) {
    const user = await this.currentUser(userId);
    const isAdmin = this.isPlatformAdmin(user.role);
    const where: any = {};
    if (!isAdmin) {
      if (user.companyId) where.companyId = user.companyId;
      else where.userId = userId;
    }
    if (taskId) where.taskId = taskId;
    return this.prisma.fileAsset.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
}

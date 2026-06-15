import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModelConfigService {
  constructor(private readonly prisma: PrismaService) {}

  private encryptionKey() {
    const seed = process.env.CONFIG_ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev_secret';
    return createHash('sha256').update(seed).digest();
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join('.');
  }

  private decrypt(value?: string | null) {
    if (!value) return '';
    const [ivB64, tagB64, encryptedB64] = value.split('.');
    if (!ivB64 || !tagB64 || !encryptedB64) return '';
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedB64, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  private async currentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async getPublicConfig(userId: string) {
    await this.currentUser(userId);
    const item = await this.prisma.modelConfig.findUnique({ where: { ownerUserId: userId } });
    return {
      enabled: !!item?.enabled,
      provider: item?.provider || 'OPENAI_COMPATIBLE',
      apiUrl: item?.apiUrl || '',
      modelName: item?.modelName || 'gpt-4.1-mini',
      hasApiKey: !!item?.apiKeyCiphertext,
      maskedApiKey: item?.apiKeyCiphertext ? '已保存' : '',
    };
  }

  async saveConfig(
    userId: string,
    body: { enabled?: boolean; apiUrl?: string; apiKey?: string; modelName?: string; provider?: string },
  ) {
    await this.currentUser(userId);
    const existing = await this.prisma.modelConfig.findUnique({ where: { ownerUserId: userId } });
    const apiKeyCiphertext =
      body.apiKey === undefined
        ? existing?.apiKeyCiphertext || null
        : body.apiKey.trim()
          ? this.encrypt(body.apiKey.trim())
          : null;

    await this.prisma.modelConfig.upsert({
      where: { ownerUserId: userId },
      update: {
        ...(body.enabled !== undefined ? { enabled: !!body.enabled } : {}),
        ...(body.apiUrl !== undefined ? { apiUrl: body.apiUrl.trim() || null } : {}),
        ...(body.modelName !== undefined ? { modelName: body.modelName.trim() || null } : {}),
        ...(body.provider !== undefined ? { provider: body.provider.trim() || 'OPENAI_COMPATIBLE' } : {}),
        apiKeyCiphertext,
      },
      create: {
        ownerUserId: userId,
        enabled: !!body.enabled,
        provider: body.provider?.trim() || 'OPENAI_COMPATIBLE',
        apiUrl: body.apiUrl?.trim() || null,
        apiKeyCiphertext,
        modelName: body.modelName?.trim() || 'gpt-4.1-mini',
      },
    });

    return this.getPublicConfig(userId);
  }

  async getRuntimeConfig(userId: string) {
    await this.currentUser(userId);
    const item = await this.prisma.modelConfig.findUnique({ where: { ownerUserId: userId } });
    if (!item?.enabled || !item.apiUrl || !item.apiKeyCiphertext) return null;
    return {
      enabled: item.enabled,
      apiUrl: item.apiUrl,
      apiKey: this.decrypt(item.apiKeyCiphertext),
      modelName: item.modelName || 'gpt-4.1-mini',
    };
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  private async currentUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyName: true },
    });
  }

  async list(userId: string) {
    const me = await this.currentUser(userId);
    const rows = await this.prisma.reportTemplate.findMany({
      where: {
        isActive: true,
        OR: [
          { scope: 'SYSTEM' },
          ...(me?.companyName ? [{ scope: me.companyName }] : []),
        ],
      },
      orderBy: [{ scope: 'asc' }, { updatedAt: 'desc' }],
    });
    if (rows.length > 0) return rows;
    return [
      {
        id: 'demo-template',
        name: '标准审核报告模板',
        code: 'STANDARD',
        scope: 'SYSTEM',
        versionNo: 1,
        schema: { sections: ['封面', '基础信息', '评分', '风险', '建议', '复核', '留痕'] },
        isActive: true,
      },
    ];
  }

  async create(userId: string, body: { name: string; code: string; scope?: string; versionNo?: number; schema?: any }) {
    const me = await this.currentUser(userId);
    const scope = me?.role === 'SYSTEM_ADMIN' ? body.scope || 'SYSTEM' : me?.companyName || 'SYSTEM';

    return this.prisma.reportTemplate.create({
      data: {
        name: body.name,
        code: body.code,
        scope,
        versionNo: body.versionNo || 1,
        schema: body.schema || {},
        isActive: true,
      },
    });
  }

  async update(userId: string, id: string, body: { name?: string; code?: string; scope?: string; versionNo?: number; schema?: any }) {
    const me = await this.currentUser(userId);
    const item = await this.prisma.reportTemplate.findUnique({ where: { id } });
    if (!item) return { id, updated: false };
    if (me?.role !== 'SYSTEM_ADMIN' && item.scope !== (me?.companyName || '')) {
      throw new ForbiddenException('无权修改其他企业模板');
    }

    return this.prisma.reportTemplate.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.code !== undefined ? { code: body.code } : {}),
        ...(me?.role === 'SYSTEM_ADMIN' && body.scope !== undefined ? { scope: body.scope } : {}),
        ...(body.versionNo !== undefined ? { versionNo: body.versionNo } : {}),
        ...(body.schema !== undefined ? { schema: body.schema } : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    const me = await this.currentUser(userId);
    const item = await this.prisma.reportTemplate.findUnique({ where: { id } });
    if (!item) return { id, deleted: false };
    if (me?.role !== 'SYSTEM_ADMIN' && item.scope !== (me?.companyName || '')) {
      throw new ForbiddenException('无权删除其他企业模板');
    }
    return this.prisma.reportTemplate.update({ where: { id }, data: { isActive: false } });
  }
}

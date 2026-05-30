import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.reportTemplate.findMany({ where: { isActive: true }, orderBy: [{ scope: 'asc' }, { updatedAt: 'desc' }] });
    if (rows.length > 0) return rows;
    return [
      {
        id: 'demo-template',
        name: '标准审核报告模板（MVP版）',
        code: 'MVP_STANDARD',
        scope: 'SYSTEM',
        versionNo: 1,
        schema: { sections: ['封面', '基础信息', '评分', '风险', '建议', '复核', '留痕'] },
        isActive: true,
      },
    ];
  }

  create(body: { name: string; code: string; scope?: string; versionNo?: number; schema?: any }) {
    return this.prisma.reportTemplate.create({
      data: {
        name: body.name,
        code: body.code,
        scope: body.scope || 'SYSTEM',
        versionNo: body.versionNo || 1,
        schema: body.schema || {},
        isActive: true,
      },
    });
  }

  async update(id: string, body: { name?: string; code?: string; scope?: string; versionNo?: number; schema?: any }) {
    const item = await this.prisma.reportTemplate.findUnique({ where: { id } });
    if (!item) return { id, updated: false };
    return this.prisma.reportTemplate.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.code !== undefined ? { code: body.code } : {}),
        ...(body.scope !== undefined ? { scope: body.scope } : {}),
        ...(body.versionNo !== undefined ? { versionNo: body.versionNo } : {}),
        ...(body.schema !== undefined ? { schema: body.schema } : {}),
      },
    });
  }
  async remove(id: string) {
    const item = await this.prisma.reportTemplate.findUnique({ where: { id } });
    if (!item) return { id, deleted: false };
    return this.prisma.reportTemplate.update({ where: { id }, data: { isActive: false } });
  }

}



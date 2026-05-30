import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRuleDto) {
    return this.prisma.rule.create({ data: { ...dto, keywords: dto.keywords as unknown as object } });
  }

  list() { return this.prisma.rule.findMany({ orderBy: { createdAt: 'desc' } }); }

  async detail(id: string) { const rule = await this.prisma.rule.findUnique({ where: { id } }); if (!rule) throw new NotFoundException('规则不存在'); return rule; }

  async update(id: string, dto: UpdateRuleDto) {
    await this.detail(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.keywords) data.keywords = dto.keywords as unknown as object;
    return this.prisma.rule.update({ where: { id }, data });
  }

  async remove(id: string) { await this.detail(id); await this.prisma.rule.delete({ where: { id } }); return { id }; }

  versions(ruleId: string) {
    return this.prisma.ruleVersion.findMany({ where: { ruleId }, orderBy: { createdAt: 'desc' } });
  }

  async cloneVersion(ruleId: string, createdBy?: string, note?: string) {
    const rule = await this.detail(ruleId);
    const count = await this.prisma.ruleVersion.count({ where: { ruleId } });
    const versionNo = `v${count + 1}.0`;
    const rv = await this.prisma.ruleVersion.create({
      data: {
        ruleId,
        versionNo,
        createdBy: createdBy || 'SYSTEM',
        snapshot: { ...rule, note: note || '' } as any,
      },
    });
    await this.prisma.rule.update({ where: { id: ruleId }, data: { version: (rule.version || 1) + 1 } });
    return rv;
  }
}

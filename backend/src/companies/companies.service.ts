import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
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

  private async assertCompanyAccess(userId: string, companyId: string, options?: { mutate?: boolean; platformOnly?: boolean }) {
    const me = await this.currentUser(userId);
    if (this.isPlatformAdmin(me.role)) return me;
    if (options?.platformOnly) throw new ForbiddenException('仅平台管理员可以执行该操作');
    if (!me.companyId || me.companyId !== companyId) throw new ForbiddenException('无权访问该企业');
    if (options?.mutate && me.role !== 'ENTERPRISE_ADMIN' && me.role !== 'MANAGER') {
      throw new ForbiddenException('无权修改企业信息');
    }
    return me;
  }

  async list(userId: string) {
    const me = await this.currentUser(userId);
    const where = this.isPlatformAdmin(me.role) ? {} : me.companyId ? { id: me.companyId } : { id: '__none__' };
    return this.prisma.company.findMany({
      where,
      include: {
        members: { include: { user: { select: { id: true, username: true, email: true, role: true, companyId: true } } } },
        tasks: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateCompanyDto) {
    const me = await this.currentUser(userId);
    if (!this.isPlatformAdmin(me.role)) throw new ForbiddenException('仅平台管理员可以创建企业');
    return this.prisma.company.create({
      data: {
        name: dto.name,
        industryType: dto.industryType,
        contactPerson: dto.contactPerson,
        contactPhone: dto.contactPhone,
        targetMarkets: dto.targetMarkets || [],
        planType: dto.planType,
        serviceStatus: dto.serviceStatus || 'OPENING',
      },
    });
  }

  async detail(userId: string, id: string) {
    await this.assertCompanyAccess(userId, id);
    const item = await this.prisma.company.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, username: true, email: true, role: true, companyId: true } } } },
        tasks: { include: { report: true } },
        customers: true,
        batchTasks: true,
      },
    });
    if (!item) throw new NotFoundException('企业不存在');
    return item;
  }

  async update(userId: string, id: string, dto: Partial<CreateCompanyDto>) {
    await this.assertCompanyAccess(userId, id, { mutate: true });
    await this.detail(userId, id);
    return this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name,
        industryType: dto.industryType,
        contactPerson: dto.contactPerson,
        contactPhone: dto.contactPhone,
        targetMarkets: dto.targetMarkets as any,
        planType: dto.planType,
        serviceStatus: dto.serviceStatus,
      },
    });
  }

  async addMember(currentUserId: string, id: string, userId: string, role: string) {
    await this.assertCompanyAccess(currentUserId, id, { mutate: true });
    const company = await this.prisma.company.findUnique({ where: { id }, select: { name: true } });
    if (!company) throw new NotFoundException('企业不存在');
    await this.prisma.user.update({ where: { id: userId }, data: { companyId: id, companyName: company.name } });
    return this.prisma.teamMember.upsert({
      where: { companyId_userId: { companyId: id, userId } },
      update: { role: role as any, status: 'ACTIVE' },
      create: { companyId: id, userId, role: role as any, status: 'ACTIVE' },
    });
  }

  async remove(userId: string, id: string) {
    await this.assertCompanyAccess(userId, id, { platformOnly: true });
    await this.detail(userId, id);
    await this.prisma.teamMember.deleteMany({ where: { companyId: id } });
    await this.prisma.user.updateMany({ where: { companyId: id }, data: { companyId: null, companyName: null } });
    await this.prisma.customer.updateMany({ where: { companyId: id }, data: { companyId: null } });
    await this.prisma.materialTask.updateMany({ where: { companyId: id }, data: { companyId: null } });
    await this.prisma.batchTask.updateMany({ where: { companyId: id }, data: { companyId: null } });
    await this.prisma.fileAsset.updateMany({ where: { companyId: id }, data: { companyId: null } });
    await this.prisma.subscription.updateMany({ where: { companyId: id }, data: { companyId: null } });
    return this.prisma.company.delete({ where: { id } });
  }
}

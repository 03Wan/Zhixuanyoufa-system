import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
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

  async list(userId: string, query?: { keyword?: string; serviceStatus?: string }) {
    const me = await this.currentUser(userId);
    const where: any = {};
    if (!this.isPlatformAdmin(me.role)) {
      if (!me.companyId) return [];
      where.companyId = me.companyId;
    }
    if (query?.keyword) where.name = { contains: query.keyword, mode: 'insensitive' };
    if (query?.serviceStatus) where.serviceStatus = query.serviceStatus;
    return this.prisma.customer.findMany({ where, include: { company: true }, orderBy: { createdAt: 'desc' } });
  }

  async create(userId: string, dto: CreateCustomerDto) {
    const me = await this.currentUser(userId);
    const companyId = this.isPlatformAdmin(me.role) ? dto.companyId || me.companyId : me.companyId;
    if (!companyId) throw new ForbiddenException('当前账号未绑定企业');
    if (!this.isPlatformAdmin(me.role) && dto.companyId && dto.companyId !== me.companyId) {
      throw new ForbiddenException('无权为其他企业创建客户');
    }
    return this.prisma.customer.create({
      data: {
        ownerUserId: userId,
        companyId,
        name: dto.name,
        customerType: dto.customerType,
        contactPerson: dto.contactPerson,
        contactPhone: dto.contactPhone,
        industry: dto.industry,
        targetPlatform: dto.targetPlatform,
        targetMarket: dto.targetMarket,
        planType: dto.planType,
        serviceStatus: dto.serviceStatus || 'OPENING',
        remark: dto.remark,
      },
    });
  }

  async update(userId: string, id: string, dto: Partial<CreateCustomerDto>) {
    const me = await this.currentUser(userId);
    const item = await this.prisma.customer.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('客户不存在');
    if (!this.isPlatformAdmin(me.role) && item.companyId !== me.companyId) {
      throw new ForbiddenException('无权修改该客户');
    }
    const data = { ...dto } as any;
    if (!this.isPlatformAdmin(me.role)) delete data.companyId;
    if (data.serviceStatus === '开通中') data.serviceStatus = 'OPENING';
    return this.prisma.customer.update({ where: { id }, data });
  }
}

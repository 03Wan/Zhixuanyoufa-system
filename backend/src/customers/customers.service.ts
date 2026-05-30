import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  list(query?: { keyword?: string; serviceStatus?: string }) {
    const where: any = {};
    if (query?.keyword) where.name = { contains: query.keyword };
    if (query?.serviceStatus) where.serviceStatus = query.serviceStatus;
    return this.prisma.customer.findMany({ where, include: { company: true }, orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ownerUserId: userId,
        companyId: dto.companyId,
        name: dto.name,
        customerType: dto.customerType,
        contactPerson: dto.contactPerson,
        contactPhone: dto.contactPhone,
        industry: dto.industry,
        targetPlatform: dto.targetPlatform,
        targetMarket: dto.targetMarket,
        planType: dto.planType,
        serviceStatus: dto.serviceStatus || '试点中',
        remark: dto.remark,
      },
    });
  }

  async update(id: string, dto: Partial<CreateCustomerDto>) {
    const item = await this.prisma.customer.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('客户不存在');
    return this.prisma.customer.update({ where: { id }, data: dto as any });
  }
}

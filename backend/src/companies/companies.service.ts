import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.company.findMany({
      include: {
        members: { include: { user: { select: { id: true, username: true, email: true, role: true } } } },
        tasks: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        industryType: dto.industryType,
        contactPerson: dto.contactPerson,
        contactPhone: dto.contactPhone,
        targetMarkets: dto.targetMarkets || [],
        planType: dto.planType,
        serviceStatus: dto.serviceStatus || '试点中',
      },
    });
  }

  async detail(id: string) {
    const item = await this.prisma.company.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, username: true, email: true, role: true } } } },
        tasks: { include: { report: true } },
        customers: true,
        batchTasks: true,
      },
    });
    if (!item) throw new NotFoundException('企业不存在');
    return item;
  }

  async update(id: string, dto: Partial<CreateCompanyDto>) {
    await this.detail(id);
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

  async addMember(id: string, userId: string, role: string) {
    await this.detail(id);
    await this.prisma.user.update({ where: { id: userId }, data: { companyName: (await this.prisma.company.findUnique({ where: { id }, select: { name: true } }))?.name || undefined } });
    return this.prisma.teamMember.upsert({
      where: { companyId_userId: { companyId: id, userId } },
      update: { role: role as any, status: 'ACTIVE' },
      create: { companyId: id, userId, role: role as any, status: 'ACTIVE' },
    });
  }

  async remove(id: string) {
    await this.detail(id);
    await this.prisma.teamMember.deleteMany({ where: { companyId: id } });
    await this.prisma.customer.updateMany({ where: { companyId: id }, data: { companyId: null } });
    await this.prisma.materialTask.updateMany({ where: { companyId: id }, data: { companyId: null } });
    await this.prisma.batchTask.updateMany({ where: { companyId: id }, data: { companyId: null } });
    return this.prisma.company.delete({ where: { id } });
  }

}


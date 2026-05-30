import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private withEnterpriseId<T extends { companyName?: string | null }>(u: T | null) {
    if (!u) return u;
    return { ...u, enterpriseId: u.companyName || null };
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, companyName: true, role: true, createdAt: true, updatedAt: true },
    });
    return users.map((u) => this.withEnterpriseId(u));
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, email: true, companyName: true, role: true, createdAt: true, updatedAt: true } });
    return this.withEnterpriseId(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: dto, select: { id: true, username: true, email: true, companyName: true, role: true, createdAt: true, updatedAt: true } });
    return this.withEnterpriseId(user);
  }

  async updateUser(userId: string, dto: Partial<UpdateProfileDto & { role?: string }>) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { username: dto.username, companyName: dto.companyName, role: dto.role as any },
      select: { id: true, username: true, email: true, companyName: true, role: true, createdAt: true, updatedAt: true },
    });
    return this.withEnterpriseId(user);
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { id: userId };
  }
}


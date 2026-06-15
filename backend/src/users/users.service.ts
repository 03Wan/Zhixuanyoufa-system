import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private withEnterpriseId<T extends { companyName?: string | null }>(u: T | null) {
    if (!u) return u;
    return { ...u, enterpriseId: u.companyName || null };
  }

  private async currentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyName: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async listUsers(currentUserId: string) {
    const me = await this.currentUser(currentUserId);
    const where =
      me.role === 'SYSTEM_ADMIN' || me.role === 'ADMIN'
        ? {}
        : me.companyName
          ? { companyName: me.companyName }
          : { id: currentUserId };

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        companyName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users.map((u) => this.withEnterpriseId(u));
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        companyName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return this.withEnterpriseId(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        username: true,
        email: true,
        companyName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return this.withEnterpriseId(user);
  }

  async updateUser(currentUserId: string, userId: string, dto: Partial<UpdateProfileDto & { role?: string }>) {
    const me = await this.currentUser(currentUserId);
    const target = await this.currentUser(userId);

    if (
      me.role !== 'SYSTEM_ADMIN' &&
      me.role !== 'ADMIN' &&
      (!me.companyName || me.companyName !== target.companyName)
    ) {
      throw new ForbiddenException('无权修改其他企业用户');
    }

    if (
      me.role !== 'SYSTEM_ADMIN' &&
      dto.role &&
      dto.role !== target.role &&
      ['SYSTEM_ADMIN', 'ADMIN'].includes(dto.role)
    ) {
      throw new ForbiddenException('无权授予平台级角色');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        companyName: dto.companyName,
        role: dto.role as any,
      },
      select: {
        id: true,
        username: true,
        email: true,
        companyName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return this.withEnterpriseId(user);
  }

  async deleteUser(currentUserId: string, userId: string) {
    const me = await this.currentUser(currentUserId);
    const target = await this.currentUser(userId);

    if (me.id === target.id) {
      throw new ForbiddenException('不能删除当前登录用户');
    }

    if (
      me.role !== 'SYSTEM_ADMIN' &&
      me.role !== 'ADMIN' &&
      (!me.companyName || me.companyName !== target.companyName)
    ) {
      throw new ForbiddenException('无权删除其他企业用户');
    }

    await this.prisma.user.delete({ where: { id: userId } });
    return { id: userId };
  }
}

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly resetTokenStore = new Map<string, { token: string; expiresAt: number }>();

  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({ where: { OR: [{ email: dto.email }, { username: dto.username }] } });
    if (exists) throw new ConflictException('邮箱或用户名已存在');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        companyName: dto.companyName,
        passwordHash,
      },
      select: { id: true, username: true, email: true, companyName: true, role: true, createdAt: true },
    });
    return { ...user, enterpriseId: user.companyName || null };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('账号或密码错误');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('账号或密码错误');

    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, username: user.username });
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        companyName: user.companyName,
        enterpriseId: user.companyName || null,
        role: user.role,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return { success: true, message: '若邮箱存在，将收到重置指引' };

    const token = Math.random().toString(36).slice(2, 10).toUpperCase();
    this.resetTokenStore.set(dto.email, { token, expiresAt: Date.now() + 15 * 60 * 1000 });

    return {
      success: true,
      message: '重置口令已生成（演示模式）',
      resetToken: token,
      expiresInMinutes: 15,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const snapshot = this.resetTokenStore.get(dto.email);
    if (!snapshot || snapshot.token !== dto.token || snapshot.expiresAt < Date.now()) {
      throw new UnauthorizedException('重置口令无效或已过期');
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('账号不存在');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    this.resetTokenStore.delete(dto.email);
    return { success: true, message: '密码重置成功' };
  }
}

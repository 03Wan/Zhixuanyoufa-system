import { ConflictException, GoneException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true },
    });
    if (existing) throw new ConflictException('该邮箱或用户名已被使用');

    return this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        companyName: dto.companyName?.trim() || null,
      },
      select: { id: true, username: true, email: true, companyName: true, role: true, createdAt: true },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('账号或密码错误');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('账号或密码错误');
    if (user.role !== dto.role) throw new UnauthorizedException('所选角色与账号角色不一致');

    const accessToken = await this.jwtService.signAsync({ sub: user.id });
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

  forgotPassword() {
    throw new GoneException('请联系企业管理员重置密码');
  }

  resetPassword() {
    throw new GoneException('请联系企业管理员重置密码');
  }
}

import { GoneException, Injectable, UnauthorizedException } from '@nestjs/common';
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
    void dto;
    throw new GoneException('企业账号需提交开通申请，由平台审核后启用');
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('账号或密码错误');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('账号或密码错误');

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

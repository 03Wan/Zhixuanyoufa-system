import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  status() {
    return this.live();
  }

  @Get('live')
  live() {
    return {
      status: 'ok',
    };
  }

  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Database is not ready',
      });
    }
  }

  @Get('database')
  async database() {
    return this.ready();
  }
}

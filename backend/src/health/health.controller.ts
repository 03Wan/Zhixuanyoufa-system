import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function databaseTarget() {
  try {
    const url = new URL(process.env.DATABASE_URL || '');
    return {
      configured: true,
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.replace(/^\//, ''),
      pooler: url.hostname.includes('pooler.supabase.com'),
      pgbouncer: url.searchParams.get('pgbouncer') === 'true',
    };
  } catch {
    return {
      configured: false,
      host: null,
      port: null,
      database: null,
      pooler: false,
      pgbouncer: false,
    };
  }
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  status() {
    return {
      status: 'ok',
      database: databaseTarget(),
      runtime: {
        node: process.version,
        vercel: Boolean(process.env.VERCEL),
      },
    };
  }

  @Get('database')
  async database() {
    const startedAt = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        latencyMs: Date.now() - startedAt,
        target: databaseTarget(),
      };
    } catch (error) {
      const value = error as {
        name?: string;
        code?: string;
        message?: string;
        clientVersion?: string;
      };
      const message = String(value.message || '')
        .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[database-url]')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 500);

      return {
        status: 'error',
        latencyMs: Date.now() - startedAt,
        target: databaseTarget(),
        error: {
          name: value.name || 'Error',
          code: value.code || null,
          clientVersion: value.clientVersion || null,
          message,
        },
      };
    }
  }
}

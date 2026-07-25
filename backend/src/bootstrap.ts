import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import helmet from 'helmet';

const allowedOrigins = new Set([
  'https://www.paperhelper.fun',
  'https://paperhelper.fun',
  'http://localhost:5073',
  'http://127.0.0.1:5073',
]);

const extraAllowedOrigins = new Set(
  String(process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

function normalizeSupabaseUrl(value?: string) {
  if (!value) return value;
  if (value.startsWith('mysql://')) return value;
  if (value.includes('pooler.supabase.com') && value.includes(':6543/') && !value.includes('pgbouncer=true')) {
    const hasQuery = value.includes('?');
    return `${value}${hasQuery ? '&' : '?'}pgbouncer=true&connection_limit=1`;
  }
  return value;
}

function isPrivateIpHostname(hostname: string) {
  if (/^localhost$/i.test(hostname)) return true;
  if (/^127(?:\.\d{1,3}){3}$/.test(hostname)) return true;
  if (/^10(?:\.\d{1,3}){3}$/.test(hostname)) return true;
  if (/^192\.168(?:\.\d{1,3}){2}$/.test(hostname)) return true;
  const match172 = hostname.match(/^172\.(\d{1,3})(?:\.\d{1,3}){2}$/);
  if (match172) {
    const second = Number(match172[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

function isAllowedOrigin(origin?: string) {
  if (!origin) return true;
  if (allowedOrigins.has(origin) || extraAllowedOrigins.has(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    if ((url.protocol === 'http:' || url.protocol === 'https:') && isPrivateIpHostname(url.hostname)) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function requireProductionEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  process.env.DATABASE_URL = normalizeSupabaseUrl(requireProductionEnv('DATABASE_URL'));
  process.env.JWT_SECRET = requireProductionEnv('JWT_SECRET');
} else {
  process.env.DATABASE_URL = normalizeSupabaseUrl(process.env.DATABASE_URL);
}

export async function createNestApp(adapterOrOptions?: unknown) {
  const app = adapterOrOptions
    ? await NestFactory.create(AppModule, adapterOrOptions as never)
    : await NestFactory.create(AppModule);

  app.enableCors({
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS origin is not allowed: ${origin}`));
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new PrismaExceptionFilter());

  return app;
}

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const allowedOrigins = new Set([
  'https://www.paperhelper.fun',
  'https://paperhelper.fun',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

const FALLBACK_DATABASE_URL =
  'postgresql://postgres.wnnkwjlrqvczdleqngyu:%40Wb15262578750@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';
const FALLBACK_DIRECT_URL =
  'postgresql://postgres.wnnkwjlrqvczdleqngyu:%40Wb15262578750@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';
const TARGET_SUPABASE_HOST = 'aws-1-ap-southeast-1.pooler.supabase.com';
const TARGET_SUPABASE_REF = 'wnnkwjlrqvczdleqngyu';

function normalizeSupabaseUrl(value?: string, fallback?: string) {
  if (!value) return fallback;
  if (value.startsWith('mysql://')) return fallback;
  if (value.includes('pooler.supabase.com') && value.includes(':6543/') && !value.includes('pgbouncer=true')) {
    const hasQuery = value.includes('?');
    return `${value}${hasQuery ? '&' : '?'}pgbouncer=true&connection_limit=1`;
  }
  return value;
}

function shouldUseFallbackInVercel(value: string | undefined) {
  if (!process.env.VERCEL) return false;
  if (!value) return true;
  return !value.includes(TARGET_SUPABASE_HOST) || !value.includes(TARGET_SUPABASE_REF);
}

process.env.DATABASE_URL = shouldUseFallbackInVercel(process.env.DATABASE_URL)
  ? FALLBACK_DATABASE_URL
  : normalizeSupabaseUrl(process.env.DATABASE_URL, FALLBACK_DATABASE_URL);
process.env.DIRECT_URL = shouldUseFallbackInVercel(process.env.DIRECT_URL)
  ? FALLBACK_DIRECT_URL
  : normalizeSupabaseUrl(process.env.DIRECT_URL, FALLBACK_DIRECT_URL);

if (process.env.VERCEL && process.env.DATABASE_URL === FALLBACK_DATABASE_URL) {
  process.env.DIRECT_URL = FALLBACK_DIRECT_URL;
}

export async function createNestApp(adapterOrOptions?: unknown) {
  const app = adapterOrOptions
    ? await NestFactory.create(AppModule, adapterOrOptions as never)
    : await NestFactory.create(AppModule);

  app.enableCors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS origin is not allowed: ${origin}`));
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new PrismaExceptionFilter());
  const uploadDir = process.env.VERCEL ? join('/tmp', 'uploads') : join(process.cwd(), 'uploads');
  try {
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    (app as any).useStaticAssets(uploadDir, { prefix: '/uploads/' });
  } catch {
    // Vercel serverless runtime is read-only outside /tmp; skip static asset mounting if unavailable.
  }

  return app;
}

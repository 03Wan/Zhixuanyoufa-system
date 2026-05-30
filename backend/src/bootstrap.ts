import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
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
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  (app as any).useStaticAssets(uploadDir, { prefix: '/uploads/' });

  return app;
}

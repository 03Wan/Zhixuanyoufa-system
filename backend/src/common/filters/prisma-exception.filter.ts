import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Catch(
  PrismaClientKnownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const value = exception as { message?: string; stack?: string };
    const message = String(value.message || '').replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[database-url]');

    this.logger.error(message, value.stack);

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      code: HttpStatus.SERVICE_UNAVAILABLE,
      message: message.includes('timeout') ? '数据库连接超时，请稍后重试' : '数据库服务暂不可用，请稍后重试',
      data: null,
    });
  }
}

import { Module } from '@nestjs/common';
import { ApiOpenController } from './api-open.controller';

@Module({
  controllers: [ApiOpenController],
})
export class ApiOpenModule {}

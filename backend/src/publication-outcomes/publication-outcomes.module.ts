import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LogsModule } from '../logs/logs.module';
import { PublicationOutcomesController } from './publication-outcomes.controller';
import { PublicationOutcomesService } from './publication-outcomes.service';

@Module({ imports: [PrismaModule, LogsModule], controllers: [PublicationOutcomesController], providers: [PublicationOutcomesService] })
export class PublicationOutcomesModule {}

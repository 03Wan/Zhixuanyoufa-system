import { Module } from '@nestjs/common';
import { MaterialVersionsController } from './material-versions.controller';
import { MaterialVersionsService } from './material-versions.service';

@Module({
  controllers: [MaterialVersionsController],
  providers: [MaterialVersionsService],
})
export class MaterialVersionsModule {}

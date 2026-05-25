import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionLog } from './action-log.entity';
import { ActionLogsService } from './action-logs.service';
import { ActionLogsController } from './action-logs.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ActionLog])],
  controllers: [ActionLogsController],
  providers: [ActionLogsService],
  exports: [ActionLogsService],
})
export class ActionLogsModule {}

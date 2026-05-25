import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionLog } from './action-log.entity';
import { ActionLogsService } from './action-logs.service';
import { ActionLogsController } from './action-logs.controller';
import { TodosModule } from '../todos/todos.module';
import { Todo } from '../todos/todo.entity';
import { Category } from '../categories/category.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ActionLog, Todo, Category]),
    forwardRef(() => TodosModule),
  ],
  controllers: [ActionLogsController],
  providers: [ActionLogsService],
  exports: [ActionLogsService],
})
export class ActionLogsModule {}

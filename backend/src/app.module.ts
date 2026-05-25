import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionLogsModule } from './modules/action-logs/action-logs.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { CategoriesModule } from './modules/categories/categories.module';
import { TodosModule } from './modules/todos/todos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/todo.db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ActionLogsModule,
    CategoriesModule,
    TodosModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}

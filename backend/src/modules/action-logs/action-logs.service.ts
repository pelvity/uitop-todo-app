import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionLog } from './action-log.entity';
import { Todo } from '../todos/todo.entity';
import { Category } from '../categories/category.entity';
import { TodosService } from '../todos/todos.service';

@Injectable()
export class ActionLogsService {
  constructor(
    @InjectRepository(ActionLog)
    private readonly actionLogRepository: Repository<ActionLog>,
    @Inject(forwardRef(() => TodosService))
    private readonly todosService: TodosService,
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async log(
    action: string,
    data: { todoId?: number; todoText: string; categoryName?: string; metadata?: string },
  ): Promise<ActionLog> {
    const logEntry = this.actionLogRepository.create({
      action,
      todoId: data.todoId ?? null,
      todoText: data.todoText,
      categoryName: data.categoryName ?? null,
      metadata: data.metadata ?? null,
    });
    return this.actionLogRepository.save(logEntry);
  }

  async findAll(limit: number = 50): Promise<ActionLog[]> {
    return this.actionLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async undo(id: number): Promise<{ todo?: Todo; message: string; actionLog: ActionLog }> {
    const log = await this.actionLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Action log with id ${id} not found`);
    }

    if (log.action === 'restored') {
      throw new BadRequestException('Cannot undo a restore action');
    }

    let affectedTodo: Todo | undefined;
    let message = '';

    switch (log.action) {
      case 'created': {
        if (!log.todoId) {
          throw new BadRequestException('Todo ID not specified in log');
        }
        const todo = await this.todoRepository.findOne({ where: { id: log.todoId } });
        if (!todo) {
          throw new NotFoundException('The referenced todo no longer exists');
        }
        await this.todosService.remove(log.todoId);
        message = 'Todo deleted';
        break;
      }
      case 'deleted': {
        let categoryId: number | undefined;
        if (log.categoryName) {
          const category = await this.categoryRepository.findOne({ where: { name: log.categoryName } });
          if (category) {
            categoryId = category.id;
          }
        }
        if (!categoryId) {
          const firstCategory = await this.categoryRepository.findOne({ where: {} });
          if (!firstCategory) {
            throw new BadRequestException('No categories available to associate with the restored todo');
          }
          categoryId = firstCategory.id;
        }

        const newTodo = this.todoRepository.create({
          text: log.todoText,
          categoryId,
          completed: false,
        });
        affectedTodo = await this.todoRepository.save(newTodo);
        message = 'Todo restored from deletion';
        break;
      }
      case 'completed': {
        if (!log.todoId) {
          throw new BadRequestException('Todo ID not specified in log');
        }
        const todo = await this.todoRepository.findOne({ where: { id: log.todoId } });
        if (!todo) {
          throw new NotFoundException('The referenced todo no longer exists');
        }
        todo.completed = false;
        affectedTodo = await this.todoRepository.save(todo);
        message = 'Todo marked as active';
        break;
      }
      case 'uncompleted': {
        if (!log.todoId) {
          throw new BadRequestException('Todo ID not specified in log');
        }
        const todo = await this.todoRepository.findOne({ where: { id: log.todoId } });
        if (!todo) {
          throw new NotFoundException('The referenced todo no longer exists');
        }
        todo.completed = true;
        affectedTodo = await this.todoRepository.save(todo);
        message = 'Todo marked as completed';
        break;
      }
      default:
        throw new BadRequestException(`Cannot undo action of type ${log.action}`);
    }

    const newLog = await this.log('restored', {
      todoId: affectedTodo?.id ?? log.todoId ?? undefined,
      todoText: log.todoText,
      categoryName: log.categoryName ?? undefined,
      metadata: JSON.stringify({ undoneActionId: log.id, undoneAction: log.action }),
    });

    return {
      todo: affectedTodo,
      message,
      actionLog: newLog,
    };
  }
}

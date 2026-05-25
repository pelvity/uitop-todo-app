import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CategoriesService } from '../categories/categories.service';
import { ActionLogsService } from '../action-logs/action-logs.service';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,
    private readonly categoriesService: CategoriesService,
    @Inject(forwardRef(() => ActionLogsService))
    private readonly actionLogsService: ActionLogsService,
  ) {}

  async create(dto: CreateTodoDto): Promise<Todo> {
    const category = await this.categoriesService.findOne(dto.categoryId);

    const activeCount = await this.todoRepo.count({
      where: { categoryId: dto.categoryId, completed: false },
    });

    if (activeCount >= 5) {
      throw new BadRequestException(
        'Category limit reached: maximum 5 active tasks per category',
      );
    }

    const todo = this.todoRepo.create(dto);
    const saved = await this.todoRepo.save(todo);

    await this.actionLogsService.log('created', {
      todoId: saved.id,
      todoText: saved.text,
      categoryName: category.name,
    });

    return saved;
  }

  async findAll(categoryId?: number): Promise<Todo[]> {
    const where = categoryId ? { categoryId } : {};
    return this.todoRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return todo;
  }

  async update(id: number, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);

    if (dto.completed !== undefined && dto.completed !== todo.completed) {
      await this.actionLogsService.log(
        dto.completed ? 'completed' : 'uncompleted',
        { todoId: todo.id, todoText: todo.text },
      );
    }

    Object.assign(todo, dto);
    await this.todoRepo.save(todo);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const todo = await this.findOne(id);

    let categoryName: string | undefined;
    try {
      const category = await this.categoriesService.findOne(todo.categoryId);
      categoryName = category.name;
    } catch {
      // empty - category may have been deleted
    }

    await this.actionLogsService.log('deleted', {
      todoText: todo.text,
      categoryName,
    });

    await this.todoRepo.remove(todo);
  }
}

import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Todo } from '../todos/todo.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepo.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    const todoCount = await this.todoRepo.count({ where: { categoryId: id } });
    if (todoCount > 0) {
      throw new BadRequestException('Cannot delete category with existing todos');
    }
    await this.categoryRepo.remove(category);
  }
}

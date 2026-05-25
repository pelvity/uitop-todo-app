import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './todo.entity';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(@Body() dto: CreateTodoDto): Promise<Todo> {
    return this.todosService.create(dto);
  }

  @Get()
  async findAll(
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
  ): Promise<Todo[]> {
    return this.todosService.findAll(categoryId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todosService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.todosService.remove(id);
  }
}

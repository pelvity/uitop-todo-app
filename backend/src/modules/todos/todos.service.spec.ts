import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TodosService } from './todos.service';
import { Todo } from './todo.entity';
import { CategoriesService } from '../categories/categories.service';
import { ActionLogsService } from '../action-logs/action-logs.service';

describe('TodosService', () => {
  let service: TodosService;

  const mockTodoRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoriesService = {
    findOne: jest.fn(),
  };

  const mockActionLogsService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: getRepositoryToken(Todo), useValue: mockTodoRepo },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: ActionLogsService, useValue: mockActionLogsService },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create() creates and returns a todo', async () => {
    const dto = { text: 'Test task', categoryId: 1 };
    const category = { id: 1, name: 'Work', createdAt: new Date() };
    const todo = {
      id: 1,
      text: 'Test task',
      completed: false,
      categoryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockCategoriesService.findOne.mockResolvedValue(category);
    mockTodoRepo.count.mockResolvedValue(0);
    mockTodoRepo.create.mockReturnValue(todo);
    mockTodoRepo.save.mockResolvedValue(todo);

    const result = await service.create(dto);

    expect(result).toEqual(todo);
    expect(mockCategoriesService.findOne).toHaveBeenCalledWith(1);
    expect(mockTodoRepo.count).toHaveBeenCalledWith({
      where: { categoryId: 1, completed: false },
    });
    expect(mockTodoRepo.create).toHaveBeenCalledWith(dto);
    expect(mockActionLogsService.log).toHaveBeenCalledWith('created', {
      todoId: todo.id,
      todoText: todo.text,
      categoryName: category.name,
    });
  });

  it('create() throws BadRequestException when max 5 active tasks reached', async () => {
    const dto = { text: 'Test task', categoryId: 1 };
    const category = { id: 1, name: 'Work', createdAt: new Date() };
    mockCategoriesService.findOne.mockResolvedValue(category);
    mockTodoRepo.count.mockResolvedValue(5);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(mockTodoRepo.create).not.toHaveBeenCalled();
  });

  it('create() throws NotFoundException for non-existent categoryId', async () => {
    const dto = { text: 'Test task', categoryId: 999 };
    mockCategoriesService.findOne.mockRejectedValue(
      new NotFoundException('Category with id 999 not found'),
    );

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    expect(mockTodoRepo.count).not.toHaveBeenCalled();
  });

  it('findAll() returns all todos ordered by createdAt DESC', async () => {
    const todos = [
      {
        id: 2,
        text: 'B',
        completed: false,
        categoryId: 1,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date(),
      },
      {
        id: 1,
        text: 'A',
        completed: false,
        categoryId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
    ];
    mockTodoRepo.find.mockResolvedValue(todos);

    const result = await service.findAll();

    expect(result).toEqual(todos);
    expect(mockTodoRepo.find).toHaveBeenCalledWith({
      where: {},
      order: { createdAt: 'DESC' },
    });
  });

  it('findAll(categoryId) returns filtered todos', async () => {
    const todos = [
      {
        id: 1,
        text: 'A',
        completed: false,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockTodoRepo.find.mockResolvedValue(todos);

    const result = await service.findAll(1);

    expect(result).toEqual(todos);
    expect(mockTodoRepo.find).toHaveBeenCalledWith({
      where: { categoryId: 1 },
      order: { createdAt: 'DESC' },
    });
  });

  it('findOne() returns todo by id', async () => {
    const todo = {
      id: 1,
      text: 'Test',
      completed: false,
      categoryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTodoRepo.findOne.mockResolvedValue(todo);

    const result = await service.findOne(1);

    expect(result).toEqual(todo);
    expect(mockTodoRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('findOne() throws NotFoundException for missing id', async () => {
    mockTodoRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('update() toggles completed status', async () => {
    const todo = {
      id: 1,
      text: 'Test',
      completed: false,
      categoryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = { ...todo, completed: true };
    mockTodoRepo.findOne.mockResolvedValue(todo);
    mockTodoRepo.save.mockResolvedValue(updated);

    const result = await service.update(1, { completed: true });

    expect(result).toEqual(updated);
    expect(mockActionLogsService.log).toHaveBeenCalledWith('completed', {
      todoId: 1,
      todoText: 'Test',
    });
    expect(mockTodoRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true }),
    );
  });

  it('remove() deletes a todo', async () => {
    const todo = {
      id: 1,
      text: 'Test',
      completed: false,
      categoryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const category = { id: 1, name: 'Work', createdAt: new Date() };
    mockTodoRepo.findOne.mockResolvedValue(todo);
    mockCategoriesService.findOne.mockResolvedValue(category);
    mockTodoRepo.remove.mockResolvedValue(undefined);

    await service.remove(1);

    expect(mockActionLogsService.log).toHaveBeenCalledWith('deleted', {
      todoText: 'Test',
      categoryName: 'Work',
    });
    expect(mockTodoRepo.remove).toHaveBeenCalledWith(todo);
  });
});

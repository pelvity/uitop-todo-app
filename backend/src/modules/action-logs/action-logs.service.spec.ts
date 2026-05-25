import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ActionLogsService } from './action-logs.service';
import { ActionLog } from './action-log.entity';
import { Todo } from '../todos/todo.entity';
import { Category } from '../categories/category.entity';
import { TodosService } from '../todos/todos.service';

describe('ActionLogsService', () => {
  let service: ActionLogsService;

  const mockActionLogRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockTodoRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCategoryRepo = {
    findOne: jest.fn(),
  };

  const mockTodosService = {
    remove: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionLogsService,
        { provide: getRepositoryToken(ActionLog), useValue: mockActionLogRepo },
        { provide: getRepositoryToken(Todo), useValue: mockTodoRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: TodosService, useValue: mockTodosService },
      ],
    }).compile();

    service = module.get<ActionLogsService>(ActionLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('log() creates and returns an ActionLog entry', async () => {
    const entry = {
      id: 1,
      action: 'created',
      todoId: 1,
      todoText: 'Test task',
      categoryName: null,
      metadata: null,
      createdAt: new Date(),
    };
    mockActionLogRepo.create.mockReturnValue(entry);
    mockActionLogRepo.save.mockResolvedValue(entry);

    const result = await service.log('created', {
      todoId: 1,
      todoText: 'Test task',
    });

    expect(result).toEqual(entry);
    expect(mockActionLogRepo.create).toHaveBeenCalledWith({
      action: 'created',
      todoId: 1,
      todoText: 'Test task',
      categoryName: null,
      metadata: null,
    });
    expect(mockActionLogRepo.save).toHaveBeenCalledWith(entry);
  });

  it('findAll() returns logs ordered by createdAt DESC', async () => {
    const logs = [
      {
        id: 2,
        action: 'created',
        todoId: 1,
        todoText: 'B',
        categoryName: null,
        metadata: null,
        createdAt: new Date('2024-01-02'),
      },
      {
        id: 1,
        action: 'created',
        todoId: 1,
        todoText: 'A',
        categoryName: null,
        metadata: null,
        createdAt: new Date('2024-01-01'),
      },
    ];
    mockActionLogRepo.find.mockResolvedValue(logs);

    const result = await service.findAll();

    expect(result).toEqual(logs);
    expect(mockActionLogRepo.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  });

  it('findAll(limit) respects the limit parameter', async () => {
    const logs = [
      { id: 1, action: 'created', todoId: 1, todoText: 'A', categoryName: null, metadata: null, createdAt: new Date() },
      { id: 2, action: 'completed', todoId: 2, todoText: 'B', categoryName: null, metadata: null, createdAt: new Date() },
      { id: 3, action: 'deleted', todoId: 3, todoText: 'C', categoryName: null, metadata: null, createdAt: new Date() },
    ] as ActionLog[];
    mockActionLogRepo.find.mockResolvedValue(logs);

    const result = await service.findAll(3);

    expect(result).toEqual(logs);
    expect(mockActionLogRepo.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      take: 3,
    });
  });

  describe('undo()', () => {
    it('throws NotFoundException if action log is not found', async () => {
      mockActionLogRepo.findOne.mockResolvedValue(null);
      await expect(service.undo(999)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if trying to undo a restored action', async () => {
      const restoredLog = { id: 1, action: 'restored', todoText: 'A' } as ActionLog;
      mockActionLogRepo.findOne.mockResolvedValue(restoredLog);
      await expect(service.undo(1)).rejects.toThrow(BadRequestException);
    });

    it('undoes a created action by calling TodosService.remove', async () => {
      const log = { id: 1, action: 'created', todoId: 5, todoText: 'Created' } as ActionLog;
      const todo = { id: 5, text: 'Created' } as Todo;
      mockActionLogRepo.findOne.mockResolvedValue(log);
      mockTodoRepo.findOne.mockResolvedValue(todo);
      mockActionLogRepo.create.mockReturnValue({} as ActionLog);
      mockActionLogRepo.save.mockResolvedValue({} as ActionLog);

      const result = await service.undo(1);

      expect(mockTodoRepo.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(mockTodosService.remove).toHaveBeenCalledWith(5);
      expect(result.message).toBe('Todo deleted');
    });

    it('undoes a deleted action by recreating the todo', async () => {
      const log = { id: 1, action: 'deleted', todoText: 'Deleted', categoryName: 'Work' } as ActionLog;
      const category = { id: 2, name: 'Work' } as Category;
      const recreatedTodo = { id: 10, text: 'Deleted', categoryId: 2, completed: false } as Todo;

      mockActionLogRepo.findOne.mockResolvedValue(log);
      mockCategoryRepo.findOne.mockResolvedValue(category);
      mockTodoRepo.create.mockReturnValue(recreatedTodo);
      mockTodoRepo.save.mockResolvedValue(recreatedTodo);
      mockActionLogRepo.create.mockReturnValue({} as ActionLog);
      mockActionLogRepo.save.mockResolvedValue({} as ActionLog);

      const result = await service.undo(1);

      expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({ where: { name: 'Work' } });
      expect(mockTodoRepo.create).toHaveBeenCalledWith({
        text: 'Deleted',
        categoryId: 2,
        completed: false,
      });
      expect(mockTodoRepo.save).toHaveBeenCalledWith(recreatedTodo);
      expect(result.todo).toEqual(recreatedTodo);
      expect(result.message).toBe('Todo restored from deletion');
    });

    it('undoes a completed action by marking it active', async () => {
      const log = { id: 1, action: 'completed', todoId: 6, todoText: 'Task' } as ActionLog;
      const todo = { id: 6, text: 'Task', completed: true } as Todo;

      mockActionLogRepo.findOne.mockResolvedValue(log);
      mockTodoRepo.findOne.mockResolvedValue(todo);
      mockTodoRepo.save.mockResolvedValue({ ...todo, completed: false });
      mockActionLogRepo.create.mockReturnValue({} as ActionLog);
      mockActionLogRepo.save.mockResolvedValue({} as ActionLog);

      const result = await service.undo(1);

      expect(mockTodoRepo.findOne).toHaveBeenCalledWith({ where: { id: 6 } });
      expect(todo.completed).toBe(false);
      expect(result.message).toBe('Todo marked as active');
    });

    it('undoes an uncompleted action by marking it completed', async () => {
      const log = { id: 1, action: 'uncompleted', todoId: 7, todoText: 'Task' } as ActionLog;
      const todo = { id: 7, text: 'Task', completed: false } as Todo;

      mockActionLogRepo.findOne.mockResolvedValue(log);
      mockTodoRepo.findOne.mockResolvedValue(todo);
      mockTodoRepo.save.mockResolvedValue({ ...todo, completed: true });
      mockActionLogRepo.create.mockReturnValue({} as ActionLog);
      mockActionLogRepo.save.mockResolvedValue({} as ActionLog);

      const result = await service.undo(1);

      expect(mockTodoRepo.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
      expect(todo.completed).toBe(true);
      expect(result.message).toBe('Todo marked as completed');
    });
  });
});

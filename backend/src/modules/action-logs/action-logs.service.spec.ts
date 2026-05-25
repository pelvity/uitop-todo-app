import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActionLogsService } from './action-logs.service';
import { ActionLog } from './action-log.entity';

describe('ActionLogsService', () => {
  let service: ActionLogsService;

  const mockActionLogRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionLogsService,
        { provide: getRepositoryToken(ActionLog), useValue: mockActionLogRepo },
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
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { Todo } from '../todos/todo.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  const mockTodoRepo = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: getRepositoryToken(Todo), useValue: mockTodoRepo },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findAll() returns all categories', async () => {
    const categories = [{ id: 1, name: 'Work', createdAt: new Date() }];
    mockCategoryRepo.find.mockResolvedValue(categories);

    const result = await service.findAll();

    expect(result).toEqual(categories);
    expect(mockCategoryRepo.find).toHaveBeenCalledWith({
      order: { name: 'ASC' },
    });
  });

  it('create() creates a new category', async () => {
    const dto = { name: 'Test' };
    const category = { id: 1, ...dto, createdAt: new Date() };
    mockCategoryRepo.findOne.mockResolvedValue(null);
    mockCategoryRepo.create.mockReturnValue(category);
    mockCategoryRepo.save.mockResolvedValue(category);

    const result = await service.create(dto);

    expect(result).toEqual(category);
    expect(mockCategoryRepo.create).toHaveBeenCalledWith(dto);
    expect(mockCategoryRepo.save).toHaveBeenCalledWith(category);
  });

  it('create() throws ConflictException for duplicate name', async () => {
    const dto = { name: 'Work' };
    mockCategoryRepo.findOne.mockResolvedValue({
      id: 1,
      name: 'Work',
      createdAt: new Date(),
    });

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('findOne() returns category by id', async () => {
    const category = { id: 1, name: 'Work', createdAt: new Date() };
    mockCategoryRepo.findOne.mockResolvedValue(category);

    const result = await service.findOne(1);

    expect(result).toEqual(category);
    expect(mockCategoryRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('findOne() throws NotFoundException for missing id', async () => {
    mockCategoryRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('update() updates category name', async () => {
    const existing = { id: 1, name: 'Old', createdAt: new Date() };
    const dto = { name: 'New' };
    const updated = { ...existing, name: 'New' };
    mockCategoryRepo.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null);
    mockCategoryRepo.save.mockResolvedValue(updated);

    const result = await service.update(1, dto);

    expect(result).toEqual(updated);
    expect(mockCategoryRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New' }),
    );
  });

  it('remove() deletes category', async () => {
    const category = { id: 1, name: 'Work', createdAt: new Date() };
    mockCategoryRepo.findOne.mockResolvedValue(category);
    mockTodoRepo.count.mockResolvedValue(0);
    mockCategoryRepo.remove.mockResolvedValue(undefined);

    await service.remove(1);

    expect(mockCategoryRepo.remove).toHaveBeenCalledWith(category);
  });
});

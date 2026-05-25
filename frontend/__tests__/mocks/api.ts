import type { Todo, Category, ActionLog } from '@/types';

export const mockCategories: Category[] = [
  { id: 1, name: 'Work', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2, name: 'Personal', createdAt: '2024-01-01T00:00:00.000Z' },
];

export const mockTodos: Todo[] = [
  {
    id: 1,
    text: 'Buy groceries',
    completed: false,
    categoryId: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    text: 'Finish report',
    completed: true,
    categoryId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const mockActionLogs: ActionLog[] = [
  {
    id: 1,
    action: 'created',
    todoId: 1,
    todoText: 'Buy groceries',
    categoryName: 'Personal',
    metadata: null,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// Re-apply default mock implementations after jest.resetAllMocks()
export function setupDefaultMocks(api: Record<string, jest.Mock>) {
  api.getCategories.mockResolvedValue(mockCategories);
  api.getTodos.mockResolvedValue(mockTodos);
  api.createTodo.mockImplementation((text: string, categoryId: number) =>
    Promise.resolve({
      id: Date.now(),
      text,
      completed: false,
      categoryId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Todo),
  );
  api.updateTodo.mockImplementation(
    (id: number, data: Partial<Pick<Todo, 'completed' | 'text'>>) =>
      Promise.resolve({ ...mockTodos[0], ...data, id } as Todo),
  );
  api.deleteTodo.mockResolvedValue(undefined);
  api.getActionLogs.mockResolvedValue(mockActionLogs);
}

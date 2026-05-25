import type { Todo, Category, ActionLog } from '@/types';

const mockCategories: Category[] = [
  { id: 1, name: 'Work', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2, name: 'Personal', createdAt: '2024-01-01T00:00:00.000Z' },
];

const mockTodos: Todo[] = [
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

const mockActionLogs: ActionLog[] = [
  {
    id: 1,
    action: 'created' as const,
    todoId: 1,
    todoText: 'Buy groceries',
    categoryName: 'Personal',
    metadata: null,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const getCategories = jest.fn(() => Promise.resolve(mockCategories));
export const getTodos = jest.fn(() => Promise.resolve(mockTodos));
export const createTodo = jest.fn((text: string, categoryId: number) =>
  Promise.resolve({
    id: Date.now(),
    text,
    completed: false,
    categoryId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Todo),
);
export const updateTodo = jest.fn((id: number, data: Partial<Pick<Todo, 'completed' | 'text'>>) =>
  Promise.resolve({ ...mockTodos[0], ...data, id } as Todo),
);
export const deleteTodo = jest.fn(() => Promise.resolve(undefined));
export const getActionLogs = jest.fn(() => Promise.resolve(mockActionLogs));

const defaultExport = {
  getCategories,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getActionLogs,
};
export default defaultExport;

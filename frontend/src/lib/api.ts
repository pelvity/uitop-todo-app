import axios from 'axios';
import type { Todo, Category, ActionLog } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(typeof message === 'string' ? message : message.join?.(', ') || 'Request failed'));
  },
);

export const getCategories = (): Promise<Category[]> =>
  api.get('/categories').then((r) => r.data);

export const createCategory = (name: string): Promise<Category> =>
  api.post('/categories', { name }).then((r) => r.data);

export const deleteCategory = (id: number): Promise<void> =>
  api.delete(`/categories/${id}`).then((r) => r.data);

export const getTodos = (categoryId?: number): Promise<Todo[]> =>
  api.get('/todos', { params: categoryId ? { categoryId } : {} }).then((r) => r.data);

export const createTodo = (text: string, categoryId: number): Promise<Todo> =>
  api.post('/todos', { text, categoryId }).then((r) => r.data);

export const updateTodo = (id: number, data: Partial<Pick<Todo, 'completed' | 'text'>>): Promise<Todo> =>
  api.patch(`/todos/${id}`, data).then((r) => r.data);

export const deleteTodo = (id: number): Promise<void> =>
  api.delete(`/todos/${id}`).then((r) => r.data);

export const getActionLogs = (limit: number = 50): Promise<ActionLog[]> =>
  api.get('/action-logs', { params: { limit } }).then((r) => r.data);

export const undoActionLog = (id: number): Promise<{ todo?: Todo; message: string; actionLog: ActionLog }> =>
  api.post(`/action-logs/${id}/undo`).then((r) => r.data);

export default api;

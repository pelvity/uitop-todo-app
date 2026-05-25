'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { Todo, Category } from '@/types';
import * as api from '@/lib/api';

interface TodoContextValue {
  // State
  todos: Todo[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: number | 'all';
  selectedTodoIds: Set<number>;
  searchQuery: string;

  // Filter
  setSelectedCategory: (id: number | 'all') => void;
  setSearchQuery: (q: string) => void;

  // CRUD
  fetchTodos: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createTodo: (text: string, categoryId: number) => Promise<Todo>;
  toggleComplete: (id: number, completed: boolean) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;

  // Undo helpers (called from useUndoNotification)
  restoreTodo: (id: number) => Promise<void>;
  undoDelete: (todo: Todo) => Promise<void>;

  // Bulk
  toggleSelectTodo: (id: number) => void;
  toggleSelectAll: () => void;
  bulkCompleteSelected: () => Promise<void>;
  clearSelection: () => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [selectedTodoIds, setSelectedTodoIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTodos(
        selectedCategoryId === 'all' ? undefined : selectedCategoryId
      );
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  }, []);

  const createTodo = useCallback(async (text: string, categoryId: number): Promise<Todo> => {
    const todo = await api.createTodo(text, categoryId);
    setTodos((prev) => [todo, ...prev]);
    return todo;
  }, []);

  const toggleComplete = useCallback(async (id: number, completed: boolean) => {
    const updated = await api.updateTodo(id, { completed });
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTodo = useCallback(async (id: number) => {
    await api.deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const restoreTodo = useCallback(async (id: number) => {
    const updated = await api.updateTodo(id, { completed: false });
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const undoDelete = useCallback(async (todo: Todo) => {
    const restored = await api.createTodo(todo.text, todo.categoryId);
    setTodos((prev) => [restored, ...prev]);
  }, []);

  const toggleSelectTodo = useCallback((id: number) => {
    setSelectedTodoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedTodoIds((prev) => {
      if (prev.size === todos.length) return new Set();
      return new Set(todos.map((t) => t.id));
    });
  }, [todos]);

  const bulkCompleteSelected = useCallback(async () => {
    const ids = Array.from(selectedTodoIds);
    await Promise.all(ids.map((id) => api.updateTodo(id, { completed: true })));
    setTodos((prev) => prev.map((t) => (ids.includes(t.id) ? { ...t, completed: true } : t)));
    setSelectedTodoIds(new Set());
  }, [selectedTodoIds]);

  const clearSelection = useCallback(() => {
    setSelectedTodoIds(new Set());
  }, []);

  // Load initial data
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const setSelectedCategory = useCallback((id: number | 'all') => {
    setSelectedCategoryId(id);
    setSelectedTodoIds(new Set());
  }, []);

  const value = useMemo(() => ({
    todos,
    categories,
    loading,
    error,
    selectedCategoryId,
    selectedTodoIds,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    fetchTodos,
    fetchCategories,
    createTodo,
    toggleComplete,
    deleteTodo,
    restoreTodo,
    undoDelete,
    toggleSelectTodo,
    toggleSelectAll,
    bulkCompleteSelected,
    clearSelection,
  }), [
    todos,
    categories,
    loading,
    error,
    selectedCategoryId,
    selectedTodoIds,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    fetchTodos,
    fetchCategories,
    createTodo,
    toggleComplete,
    deleteTodo,
    restoreTodo,
    undoDelete,
    toggleSelectTodo,
    toggleSelectAll,
    bulkCompleteSelected,
    clearSelection,
  ]);

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodos must be used within TodoProvider');
  return ctx;
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string;
}

export interface ActionLog {
  id: number;
  action: 'created' | 'completed' | 'uncompleted' | 'deleted' | 'restored';
  todoId: number | null;
  todoText: string;
  categoryName: string | null;
  metadata: string | null;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}

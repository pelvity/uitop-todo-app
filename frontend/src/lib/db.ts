import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface TodoRow {
  id: number;
  text: string;
  completed: boolean;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

let _db: Database.Database | null = null;

function getDbPath(): string {
  const dir = process.env.VERCEL || process.env.NODE_ENV === 'production'
    ? '/tmp/data'
    : path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'todo.db');
}

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(getDbPath());
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      categoryId INTEGER NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );
    CREATE TABLE IF NOT EXISTS action_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      todoId INTEGER,
      todoText TEXT NOT NULL,
      categoryName TEXT,
      metadata TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS todo_tags (
      todoId INTEGER NOT NULL,
      tagId INTEGER NOT NULL,
      PRIMARY KEY (todoId, tagId),
      FOREIGN KEY (todoId) REFERENCES todos(id) ON DELETE CASCADE,
      FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  const count = _db.prepare('SELECT COUNT(*) as cnt FROM categories').get() as { cnt: number };
  if (count.cnt === 0) {
    const insert = _db.prepare('INSERT INTO categories (name) VALUES (?)');
    insert.run('Work');
    insert.run('Personal');
    insert.run('Shopping');
  }

  return _db;
}

export function mapTodo(row: Record<string, unknown>): TodoRow {
  return {
    id: Number(row.id),
    text: row.text as string,
    completed: Boolean(row.completed),
    categoryId: Number(row.categoryId),
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

export function getTagsForTodo(db: Database.Database, todoId: number): string[] {
  const rows = db
    .prepare('SELECT t.name FROM tags t JOIN todo_tags tt ON t.id = tt.tagId WHERE tt.todoId = ? ORDER BY t.name')
    .all(todoId) as { name: string }[];
  return rows.map((r) => r.name);
}

export interface TodoWithTags extends TodoRow {
  tags: string[];
}

export function mapTodoWithTags(db: Database.Database, row: Record<string, unknown>): TodoWithTags {
  return {
    ...mapTodo(row),
    tags: getTagsForTodo(db, Number(row.id)),
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb, mapTodo } from '@/lib/db';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = getDb();
    const { id } = await params;
    const logId = Number(id);

    const log = db.prepare('SELECT * FROM action_logs WHERE id = ?').get(logId) as Record<string, unknown> | undefined;
    if (!log) {
      return NextResponse.json({ message: `Action log with id ${logId} not found` }, { status: 404 });
    }

    const action = log.action as string;
    const todoText = log.todoText as string;
    const categoryName = log.categoryName as string | null;

    if (action === 'restored') {
      return NextResponse.json({ message: 'Cannot undo a restore action' }, { status: 400 });
    }

    let result: Record<string, unknown> | null = null;
    let message = '';

    if (action === 'created') {
      const todoId = log.todoId as number | null;
      if (todoId) {
        const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId);
        if (existing) {
          db.prepare('DELETE FROM todos WHERE id = ?').run(todoId);
          message = 'Todo creation undone (deleted)';
        } else {
          message = 'Todo already deleted';
        }
      }
    } else if (action === 'deleted') {
      if (categoryName) {
        const category = db.prepare('SELECT id FROM categories WHERE name = ?').get(categoryName) as Record<string, unknown> | undefined;
        if (category) {
          const insertResult = db.prepare(
            'INSERT INTO todos (text, completed, categoryId, createdAt, updatedAt) VALUES (?, 0, ?, datetime(\'now\'), datetime(\'now\'))',
          ).run(todoText, category.id);
          result = db.prepare('SELECT * FROM todos WHERE id = ?').get(insertResult.lastInsertRowid) as Record<string, unknown>;
          message = 'Todo restored from deletion';
        } else {
          return NextResponse.json({ message: 'Original category no longer exists' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ message: 'Cannot restore: no category information' }, { status: 400 });
      }
    } else if (action === 'completed') {
      const todoId = log.todoId as number | null;
      if (todoId) {
        const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId) as Record<string, unknown> | undefined;
        if (!existing) {
          return NextResponse.json({ message: 'The referenced todo no longer exists' }, { status: 404 });
        }
        db.prepare("UPDATE todos SET completed = 0, updatedAt = datetime('now') WHERE id = ?").run(todoId);
        result = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId) as Record<string, unknown>;
        message = 'Todo uncompleted';
      }
    } else if (action === 'uncompleted') {
      const todoId = log.todoId as number | null;
      if (todoId) {
        const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId) as Record<string, unknown> | undefined;
        if (!existing) {
          return NextResponse.json({ message: 'The referenced todo no longer exists' }, { status: 404 });
        }
        db.prepare("UPDATE todos SET completed = 1, updatedAt = datetime('now') WHERE id = ?").run(todoId);
        result = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId) as Record<string, unknown>;
        message = 'Todo re-completed';
      }
    }

    db.prepare(
      'INSERT INTO action_logs (action, todoId, todoText, categoryName, createdAt) VALUES (?, ?, ?, ?, datetime(\'now\'))',
    ).run('restored', log.todoId, todoText, categoryName);

    return NextResponse.json({ todo: result ? mapTodo(result) : null, message });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Undo failed' },
      { status: 500 },
    );
  }
}

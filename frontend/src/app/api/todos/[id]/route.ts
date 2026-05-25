import { NextRequest, NextResponse } from 'next/server';
import { getDb, mapTodo } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = getDb();
    const { id } = await params;
    const todoId = Number(id);

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId) as Record<string, unknown> | undefined;
    if (!todo) {
      return NextResponse.json({ message: `Todo with id ${todoId} not found` }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];

    if (body.completed !== undefined) {
      updates.push('completed = ?');
      values.push(body.completed ? 1 : 0);
    }
    if (body.text !== undefined) {
      if (typeof body.text !== 'string' || body.text.trim().length === 0) {
        return NextResponse.json({ message: 'Text cannot be empty' }, { status: 400 });
      }
      updates.push('text = ?');
      values.push(body.text.trim());
    }

    if (updates.length === 0) {
      return NextResponse.json(mapTodo(todo));
    }

    updates.push("updatedAt = datetime('now')");
    values.push(todoId);

    db.prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId) as Record<string, unknown>;

    if (body.completed !== undefined && body.completed !== Boolean(todo.completed)) {
      const categoryName = todo.categoryName as string | null;
      db.prepare(
        'INSERT INTO action_logs (action, todoId, todoText, categoryName, createdAt) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      ).run(body.completed ? 'completed' : 'uncompleted', todoId, todo.text as string, categoryName);
    }

    return NextResponse.json(mapTodo(updated));
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to update todo' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = getDb();
    const { id } = await params;
    const todoId = Number(id);

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId) as Record<string, unknown> | undefined;
    if (!todo) {
      return NextResponse.json({ message: `Todo with id ${todoId} not found` }, { status: 404 });
    }

    let categoryName: string | null = null;
    const category = db.prepare('SELECT name FROM categories WHERE id = ?').get(todo.categoryId as number) as Record<string, unknown> | undefined;
    if (category) {
      categoryName = category.name as string;
    }

    db.prepare(
      'INSERT INTO action_logs (action, todoId, todoText, categoryName, createdAt) VALUES (?, ?, ?, ?, datetime(\'now\'))',
    ).run('deleted', todoId, todo.text, categoryName);

    db.prepare('DELETE FROM todos WHERE id = ?').run(todoId);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to delete todo' },
      { status: 500 },
    );
  }
}

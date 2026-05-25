import { NextRequest, NextResponse } from 'next/server';
import { getDb, mapTodo } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const categoryId = request.nextUrl.searchParams.get('categoryId');

    const rows = categoryId
      ? db.prepare('SELECT * FROM todos WHERE categoryId = ? ORDER BY createdAt DESC').all(Number(categoryId))
      : db.prepare('SELECT * FROM todos ORDER BY createdAt DESC').all();

    return NextResponse.json((rows as Record<string, unknown>[]).map(mapTodo));
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to fetch todos' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { text, categoryId } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }
    if (text.length > 255) {
      return NextResponse.json({ message: 'Max 255 characters' }, { status: 400 });
    }
    if (!categoryId || typeof categoryId !== 'number') {
      return NextResponse.json({ message: 'Category is required' }, { status: 400 });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId) as Record<string, unknown> | undefined;
    if (!category) {
      return NextResponse.json({ message: `Category with id ${categoryId} not found` }, { status: 404 });
    }

    const activeCount = db.prepare(
      'SELECT COUNT(*) as cnt FROM todos WHERE categoryId = ? AND completed = 0',
    ).get(categoryId) as { cnt: number };

    if (activeCount.cnt >= 5) {
      return NextResponse.json(
        { message: 'Category limit reached: maximum 5 active tasks per category' },
        { status: 400 },
      );
    }

    const result = db.prepare(
      'INSERT INTO todos (text, completed, categoryId, createdAt, updatedAt) VALUES (?, 0, ?, datetime(\'now\'), datetime(\'now\'))',
    ).run(text.trim(), categoryId);

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;

    db.prepare(
      'INSERT INTO action_logs (action, todoId, todoText, categoryName, createdAt) VALUES (?, ?, ?, ?, datetime(\'now\'))',
    ).run('created', result.lastInsertRowid, text.trim(), category.name);

    return NextResponse.json(mapTodo(todo), { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to create todo' },
      { status: 500 },
    );
  }
}

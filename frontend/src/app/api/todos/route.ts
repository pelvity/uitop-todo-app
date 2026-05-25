import { NextRequest, NextResponse } from 'next/server';
import { getDb, mapTodoWithTags } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const categoryId = request.nextUrl.searchParams.get('categoryId');

    const rows = categoryId
      ? db.prepare('SELECT * FROM todos WHERE categoryId = ? ORDER BY createdAt DESC').all(Number(categoryId))
      : db.prepare('SELECT * FROM todos ORDER BY createdAt DESC').all();

    return NextResponse.json((rows as Record<string, unknown>[]).map((r) => mapTodoWithTags(db, r)));
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
    const { text, categoryId, tags } = body;

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

    const todoId = result.lastInsertRowid;

    if (Array.isArray(tags) && tags.length > 0) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
      const insertTodoTag = db.prepare('INSERT OR IGNORE INTO todo_tags (todoId, tagId) VALUES (?, ?)');
      const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');

      for (const tagName of tags) {
        if (typeof tagName === 'string' && tagName.trim().length > 0) {
          const normalized = tagName.trim().toLowerCase().replace(/\s+/g, '-');
          insertTag.run(normalized);
          const tagRow = getTag.get(normalized) as { id: number } | undefined;
          if (tagRow) {
            insertTodoTag.run(todoId, tagRow.id);
          }
        }
      }
    }

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId) as Record<string, unknown>;

    db.prepare(
      'INSERT INTO action_logs (action, todoId, todoText, categoryName, createdAt) VALUES (?, ?, ?, ?, datetime(\'now\'))',
    ).run('created', todoId, text.trim(), category.name);

    return NextResponse.json(mapTodoWithTags(db, todo), { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to create todo' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const db = getDb();
    db.prepare('DELETE FROM todo_tags').run();
    db.prepare('DELETE FROM todos').run();
    db.prepare('DELETE FROM action_logs').run();
    db.prepare('DELETE FROM tags').run();
    return NextResponse.json({ message: 'All todos, tags, and action logs cleared' });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to clear todos' },
      { status: 500 },
    );
  }
}

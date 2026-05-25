import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = getDb();
    const { id } = await params;
    const categoryId = Number(id);
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    if (!existing) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const trimmed = name.trim();
    const duplicate = db.prepare('SELECT id FROM categories WHERE name = ? AND id != ?').get(trimmed, categoryId);
    if (duplicate) {
      return NextResponse.json({ message: 'Another category with this name already exists' }, { status: 409 });
    }

    db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(trimmed, categoryId);
    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to update category' },
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
    const categoryId = Number(id);

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const todoCount = db.prepare('SELECT COUNT(*) as cnt FROM todos WHERE categoryId = ?').get(categoryId) as { cnt: number };
    if (todoCount.cnt > 0) {
      return NextResponse.json(
        { message: `Cannot delete category with ${todoCount.cnt} existing todos. Reassign them first.` },
        { status: 400 },
      );
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to delete category' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const trimmed = name.trim();
    const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(trimmed);
    if (existing) {
      return NextResponse.json({ message: 'Category already exists' }, { status: 409 });
    }

    const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(trimmed);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to create category' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to fetch tags' },
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
      return NextResponse.json({ message: 'Tag name is required' }, { status: 400 });
    }

    const trimmed = name.trim().toLowerCase().replace(/\s+/g, '-');
    const existing = db.prepare('SELECT id FROM tags WHERE name = ?').get(trimmed);
    if (existing) {
      return NextResponse.json({ message: 'Tag already exists' }, { status: 409 });
    }

    const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(trimmed);
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to create tag' },
      { status: 500 },
    );
  }
}

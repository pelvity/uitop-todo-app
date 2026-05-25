import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = getDb();
    const { id } = await params;
    const tagId = Number(id);

    const existing = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId);
    if (!existing) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM todo_tags WHERE tagId = ?').run(tagId);
    db.prepare('DELETE FROM tags WHERE id = ?').run(tagId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to delete tag' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 50;
    const rows = db.prepare('SELECT * FROM action_logs ORDER BY createdAt DESC LIMIT ?').all(limit);
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to fetch action logs' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const db = getDb();
    db.prepare('DELETE FROM action_logs').run();
    return NextResponse.json({ message: 'All action logs cleared' });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to clear action logs' },
      { status: 500 },
    );
  }
}

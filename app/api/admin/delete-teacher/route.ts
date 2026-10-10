import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.teacherId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { rows: meRows } = await sql`select is_admin from teachers where id = ${session.teacherId}`;
  if (!meRows[0]?.is_admin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Teacher id required' }, { status: 400 });
  }

  if (id === session.teacherId) {
    return NextResponse.json({ error: "You can't remove your own account" }, { status: 400 });
  }

  const { rows: target } = await sql`select is_admin from teachers where id = ${id}`;
  if (!target[0]) {
    return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
  }
  if (target[0].is_admin) {
    return NextResponse.json({ error: 'Cannot remove an admin account' }, { status: 400 });
  }

  // schedule rows cascade via FK on delete
  await sql`delete from teachers where id = ${id}`;

  return NextResponse.json({ success: true });
}

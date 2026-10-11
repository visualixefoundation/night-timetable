import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

  const { id, password } = await request.json();

  if (!id || !password || String(password).length < 6) {
    return NextResponse.json(
      { error: 'Teacher id and a temporary password (6+ characters) are required' },
      { status: 400 }
    );
  }

  const { rows: target } = await sql`select id, name from teachers where id = ${id}`;
  if (!target[0]) {
    return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
  }

  const hash = await bcrypt.hash(String(password), 10);

  await sql`
    update teachers
    set password_hash = ${hash}, must_change_password = true
    where id = ${id}
  `;

  return NextResponse.json({
    success: true,
    name: target[0].name,
  });
}

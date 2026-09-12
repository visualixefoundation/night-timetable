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

  const { name, email, password } = await request.json();
  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Name, email, and a password (6+ chars) are required' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    await sql`
      insert into teachers (name, email, password_hash, is_admin, must_change_password)
      values (${name}, ${email.toLowerCase()}, ${hash}, false, true)
    `;
  } catch (err: any) {
    if (String(err.message).includes('unique')) {
      return NextResponse.json({ error: 'A teacher with that email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const { rows } = await sql`
    select id, password_hash from teachers where email = ${email.toLowerCase()}
  `;

  const teacher = rows[0];
  if (!teacher) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, teacher.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const session = await getSession();
  session.teacherId = teacher.id;
  await session.save();

  return NextResponse.json({ success: true });
}

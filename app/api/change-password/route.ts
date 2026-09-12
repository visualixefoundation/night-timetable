import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.teacherId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { newPassword } = await request.json();
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await sql`
    update teachers
    set password_hash = ${hash}, must_change_password = false
    where id = ${session.teacherId}
  `;

  return NextResponse.json({ success: true });
}

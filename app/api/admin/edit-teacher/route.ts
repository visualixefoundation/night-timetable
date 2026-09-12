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

  const { id, name, email } = await request.json();

  if (!id || !name || !email) {
    return NextResponse.json({ error: 'Teacher id, name, and email are required' }, { status: 400 });
  }

  try {
    await sql`
      update teachers
      set name = ${name}, email = ${email.toLowerCase()}
      where id = ${id}
    `;
  } catch (err: any) {
    if (String(err.message).includes('unique')) {
      return NextResponse.json({ error: 'Another teacher already has that email' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

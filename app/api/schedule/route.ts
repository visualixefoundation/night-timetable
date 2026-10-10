import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.teacherId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { date, form, note } = await request.json();
  if (!date || !['V', 'VI'].includes(form)) {
    return NextResponse.json(
      { error: 'Date and a valid form (V or VI) are required' },
      { status: 400 }
    );
  }

  // Warn if another teacher is already on this form/date
  const { rows: existing } = await sql`
    select teachers.name as teacher_name
    from schedule
    join teachers on teachers.id = schedule.teacher_id
    where schedule.date = ${date}
      and schedule.form = ${form}
      and schedule.status = 'confirmed'
      and schedule.teacher_id <> ${session.teacherId}
    limit 1
  `;

  const { rows } = await sql`
    insert into schedule (teacher_id, date, form, note, status)
    values (${session.teacherId}, ${date}, ${form}, ${note || null}, 'confirmed')
    on conflict (teacher_id, date, form)
    do update set note = excluded.note, status = 'confirmed'
    returning id, date, form, status, note
  `;

  return NextResponse.json({
    entry: rows[0],
    conflict: existing[0]
      ? { teacher_name: existing[0].teacher_name }
      : null,
  });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.teacherId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Entry id required' }, { status: 400 });
  }

  const { rows: meRows } = await sql`select is_admin from teachers where id = ${session.teacherId}`;
  const isAdmin = meRows[0]?.is_admin;

  if (isAdmin) {
    await sql`delete from schedule where id = ${id}`;
  } else {
    await sql`delete from schedule where id = ${id} and teacher_id = ${session.teacherId}`;
  }

  return NextResponse.json({ success: true });
}

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import AdminClient from './admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session.teacherId) redirect('/login');

  const { rows: meRows } = await sql`select is_admin from teachers where id = ${session.teacherId}`;
  if (!meRows[0]?.is_admin) {
    redirect('/dashboard');
  }

  const { rows: teachers } = await sql`select id, name, email, is_admin from teachers order by name`;
  const { rows: entries } = await sql`
    select schedule.id, schedule.date, schedule.form, schedule.status, schedule.note, teachers.name as teacher_name
    from schedule
    join teachers on teachers.id = schedule.teacher_id
    where schedule.date >= current_date
    order by schedule.date asc
  `;

  return (
    <AdminClient
      teachers={teachers as any}
      entries={entries as any}
      currentTeacherId={session.teacherId}
    />
  );
}

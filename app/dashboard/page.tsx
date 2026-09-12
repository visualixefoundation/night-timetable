import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import DashboardClient from './dashboard-client';

// Always render at request time - this page reads the session cookie and
// queries the database directly, so it can't be pre-rendered at build time.
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.teacherId) {
    redirect('/login');
  }

  const { rows: teacherRows } = await sql`
    select id, name, is_admin, must_change_password from teachers where id = ${session.teacherId}
  `;
  const teacher = (teacherRows[0] as any) ?? null;

  const { rows: entries } = await sql`
    select id, date, form, status, note
    from schedule
    where teacher_id = ${session.teacherId} and date >= current_date
    order by date asc
  `;

  return <DashboardClient teacher={teacher} initialEntries={entries as any} />;
}

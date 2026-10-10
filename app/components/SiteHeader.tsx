import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import LogoutButton from './LogoutButton';

export default async function SiteHeader() {
  const session = await getSession();
  let teacher: { name: string; is_admin: boolean } | null = null;

  if (session.teacherId) {
    const { rows } = await sql`
      select name, is_admin from teachers where id = ${session.teacherId}
    `;
    teacher = (rows[0] as { name: string; is_admin: boolean } | undefined) ?? null;
  }

  return (
    <header className="bg-chalkboard text-paper border-b border-black/10 shrink-0">
      <nav className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <a
            href="/"
            className="font-display text-lg tracking-tight hover:opacity-90 transition-opacity block truncate"
          >
            Night Timetable
          </a>
          <p className="text-[11px] text-paper/55 tracking-wide truncate">
            St. Joseph Boys Science High School
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-sm shrink-0">
          {teacher ? (
            <>
              <span className="hidden sm:inline text-paper/70 truncate max-w-[10rem]">
                {teacher.name}
              </span>
              <a
                href="/dashboard"
                className="text-paper/75 hover:text-paper transition-colors"
              >
                My schedule
              </a>
              {teacher.is_admin && (
                <a
                  href="/admin"
                  className="text-paper/75 hover:text-paper transition-colors"
                >
                  Admin
                </a>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <a
                href="/dashboard"
                className="text-paper/75 hover:text-paper transition-colors"
              >
                My schedule
              </a>
              <a
                href="/login"
                className="text-paper/75 hover:text-paper transition-colors"
              >
                Login
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

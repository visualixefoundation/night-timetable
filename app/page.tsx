import { sql } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function startOfWeek(d: Date) {
  const day = d.getDay();
  const monday = new Date(d);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return monday;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
}

function toYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

const FORMS = [
  { key: 'V', label: 'Form V', dot: 'bg-sage' },
  { key: 'VI', label: 'Form VI', dot: 'bg-gold' },
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  let anchor = startOfWeek(today);
  if (searchParams.week && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.week)) {
    const parsed = new Date(searchParams.week + 'T12:00:00');
    if (!Number.isNaN(parsed.getTime())) {
      anchor = startOfWeek(parsed);
    }
  }

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(anchor, i));
  const from = toYmd(weekDates[0]);
  const to = toYmd(weekDates[6]);
  const prevWeek = toYmd(addDays(anchor, -7));
  const nextWeek = toYmd(addDays(anchor, 7));
  const thisWeek = toYmd(startOfWeek(today));
  const isThisWeek = from === thisWeek;

  const { rows: entries } = await sql`
    select schedule.id, schedule.date, schedule.form, schedule.note, teachers.name as teacher_name
    from schedule
    join teachers on teachers.id = schedule.teacher_id
    where schedule.date >= ${from} and schedule.date <= ${to} and schedule.status = 'confirmed'
  `;

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <p className="text-sm text-muted mb-1.5 tracking-wide">
          {isThisWeek ? 'This week' : 'Week of'}{' '}
          {!isThisWeek && (
            <span className="text-ink">
              {weekDates[0].toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
              {' – '}
              {weekDates[6].toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-ink tracking-tight">
          Night class timetable
        </h1>

        <div className="mt-5 flex items-center justify-center gap-3 text-sm">
          <Link
            href={`/?week=${prevWeek}`}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-muted hover:text-ink hover:border-ink/20 transition-colors"
          >
            ← Prev
          </Link>
          {!isThisWeek ? (
            <Link
              href="/"
              className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-gold hover:bg-gold/15 transition-colors"
            >
              This week
            </Link>
          ) : (
            <span className="px-3 py-1.5 text-muted/60">This week</span>
          )}
          <Link
            href={`/?week=${nextWeek}`}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-muted hover:text-ink hover:border-ink/20 transition-colors"
          >
            Next →
          </Link>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0 lg:snap-none">
        {weekDates.map((date) => {
          const dateStr = toYmd(date);
          const dayEntries = entries.filter(
            (e: any) => String(e.date).slice(0, 10) === dateStr
          );
          const isToday = isSameDay(date, today);

          return (
            <div
              key={dateStr}
              className={`
                group relative rounded-xl border p-4 transition-all duration-200
                min-w-[11.5rem] snap-start shrink-0 lg:min-w-0 lg:shrink
                ${
                  isToday
                    ? 'bg-gold/[0.07] border-gold/60 border-l-[3px] shadow-md shadow-gold/10'
                    : 'bg-white border-line hover:border-line/80 hover:shadow-md hover:-translate-y-0.5'
                }
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div
                    className={`font-display text-lg leading-none ${
                      isToday ? 'text-gold' : 'text-ink'
                    }`}
                  >
                    {date.toLocaleDateString(undefined, { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {date.toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>

                {isToday && (
                  <span className="text-[11px] font-medium bg-gold/20 text-gold rounded-full px-2.5 py-0.5 tracking-wide">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {FORMS.map(({ key, label, dot }) => {
                  const formEntries = dayEntries.filter(
                    (e: any) => e.form === key
                  );

                  return (
                    <div key={key}>
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                      </div>

                      {formEntries.length === 0 ? (
                        <div className="text-sm text-muted/60 pl-3.5 italic">
                          No one yet
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {formEntries.map((e: any) => (
                            <div
                              key={e.id}
                              className="text-sm pl-3.5 text-ink leading-snug"
                            >
                              {e.teacher_name}
                              {e.note && (
                                <span className="text-muted"> — {e.note}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

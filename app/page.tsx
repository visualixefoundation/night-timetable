import { sql } from '@/lib/db';

// Always render at request time - this page queries the database directly,
// and shouldn't be pre-rendered at build time (before the DB env vars exist).
export const dynamic = 'force-dynamic';

function getWeekDates() {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

const FORMS = [
  { key: 'V', label: 'Form V', dot: 'bg-sage' },
  { key: 'VI', label: 'Form VI', dot: 'bg-gold' },
] as const;

export default async function HomePage() {
  const weekDates = getWeekDates();
  const from = weekDates[0].toISOString().slice(0, 10);
  const to = weekDates[6].toISOString().slice(0, 10);

  const { rows: entries } = await sql`
    select schedule.id, schedule.date, schedule.form, schedule.note, teachers.name as teacher_name
    from schedule
    join teachers on teachers.id = schedule.teacher_id
    where schedule.date >= ${from} and schedule.date <= ${to} and schedule.status = 'confirmed'
  `;

  const today = new Date();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-muted mb-1">This week</p>
        <h1 className="font-display text-3xl text-ink">Night class timetable</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDates.map((date) => {
          const dateStr = date.toISOString().slice(0, 10);
          const dayEntries = entries.filter((e: any) => String(e.date).slice(0, 10) === dateStr);
          const isToday = isSameDay(date, today);

          return (
            <div
              key={dateStr}
              className={`rounded-lg bg-white border p-4 ${
                isToday ? 'border-gold border-l-4 shadow-sm' : 'border-line'
              }`}
            >
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <div className="font-display text-lg leading-tight">
                    {date.toLocaleDateString(undefined, { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-muted">
                    {date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                {isToday && (
                  <span className="text-xs bg-gold/15 text-gold rounded-full px-2 py-0.5">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {FORMS.map(({ key, label, dot }) => {
                  const formEntries = dayEntries.filter((e: any) => e.form === key);
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                      </div>
                      {formEntries.length === 0 ? (
                        <div className="text-sm text-muted/70 pl-3">No one yet</div>
                      ) : (
                        formEntries.map((e: any) => (
                          <div key={e.id} className="text-sm pl-3">
                            {e.teacher_name}
                            {e.note && <span className="text-muted"> — {e.note}</span>}
                          </div>
                        ))
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

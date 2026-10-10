'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Entry = {
  id: string;
  date: string;
  form: string;
  status: string;
  note: string | null;
};

type Teacher = {
  id: string;
  name: string;
  is_admin: boolean;
  must_change_password: boolean;
} | null;

function defaultDate() {
  const d = new Date();
  if (d.getHours() >= 17) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0, 10);
}

export default function DashboardClient({
  teacher,
  initialEntries,
}: {
  teacher: Teacher;
  initialEntries: Entry[];
}) {
  const [entries, setEntries] = useState(
    initialEntries.map((e) => ({ ...e, date: String(e.date).slice(0, 10) }))
  );
  const [date, setDate] = useState(defaultDate);
  const [form, setForm] = useState<'V' | 'VI'>('V');
  const [note, setNote] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const upcomingLabel = useMemo(() => {
    if (entries.length === 0) return 'Nothing scheduled yet.';
    return null;
  }, [entries.length]);

  async function submitSchedule(force = false) {
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, form, note, force }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    if (data.needsConfirm && data.conflict?.teacher_name) {
      const ok = window.confirm(
        `Form ${form} on ${date} already has ${data.conflict.teacher_name}. Mark yourself as teaching anyway?`
      );
      if (!ok) return;
      return submitSchedule(true);
    }

    const newEntry = { ...data.entry, date: String(data.entry.date).slice(0, 10) };
    setEntries((prev) =>
      [...prev.filter((x) => x.id !== newEntry.id), newEntry].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    );
    setNote('');
    setSuccess(`Marked Form ${form} on ${date}.`);
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await submitSchedule(false);
    } finally {
      setSaving(false);
    }
  }

  async function cancelEntry(id: string, label: string) {
    if (!window.confirm(`Cancel ${label}?`)) return;

    setError('');
    setSuccess('');
    await fetch('/api/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSuccess('Night cancelled.');
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    router.refresh();
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  if (!teacher) {
    return (
      <p className="text-center text-muted py-10">
        Could not load your account. Contact the admin.
      </p>
    );
  }

  if (teacher.must_change_password) {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl text-ink tracking-tight">Set a new password</h1>
          <p className="text-sm text-muted mt-2">
            First login — choose a password only you know.
          </p>
        </div>
        <form
          onSubmit={changePassword}
          className="bg-white border border-line rounded-xl p-6 shadow-sm space-y-4"
        >
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password (6+ characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
          />
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button className="w-full rounded-lg bg-sage text-paper py-2.5 font-medium hover:bg-sage/90 transition-colors">
            Save password
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <p className="text-sm text-muted mb-1">Teacher dashboard</p>
          <h1 className="font-display text-2xl sm:text-3xl text-ink tracking-tight">
            Welcome, {teacher.name}
          </h1>
        </div>
        <div className="flex gap-3 text-sm">
          {teacher.is_admin && (
            <a
              href="/admin"
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-sage hover:border-sage/40 transition-colors"
            >
              Admin panel
            </a>
          )}
          <button
            onClick={logout}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-muted hover:text-ink transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      <form
        onSubmit={addEntry}
        className="bg-white border border-line rounded-xl p-5 mb-4 shadow-sm flex flex-wrap gap-3 items-end"
      >
        <div>
          <label className="block text-sm text-muted mb-1.5">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1.5">Form</label>
          <select
            value={form}
            onChange={(e) => setForm(e.target.value as 'V' | 'VI')}
            className="rounded-lg border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
          >
            <option value="V">Form V</option>
            <option value="VI">Form VI</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm text-muted mb-1.5">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            placeholder="e.g. covering half session"
          />
        </div>
        <button
          disabled={saving}
          className="rounded-lg bg-sage text-paper px-4 py-2 font-medium hover:bg-sage/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Mark as teaching'}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}
      {success && (
        <p className="text-sm text-sage bg-sage/10 rounded-lg px-3 py-2 mb-4">{success}</p>
      )}

      <h2 className="font-display text-lg text-ink mb-3">Your upcoming nights</h2>
      <div className="space-y-2">
        {upcomingLabel && (
          <p className="text-sm text-muted italic bg-white border border-line rounded-xl px-4 py-6 text-center">
            {upcomingLabel}
          </p>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className="bg-white border border-line rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm"
          >
            <div>
              <span className="font-medium text-ink">{e.date}</span>
              <span className="text-muted"> — Form {e.form}</span>
              {e.note && <span className="text-muted/70"> ({e.note})</span>}
            </div>
            <button
              onClick={() => cancelEntry(e.id, `Form ${e.form} on ${e.date}`)}
              className="text-sm text-red-600 hover:underline shrink-0"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

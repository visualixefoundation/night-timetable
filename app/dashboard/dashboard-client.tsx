'use client';

import { useState } from 'react';
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
  const [date, setDate] = useState('');
  const [form, setForm] = useState<'V' | 'VI'>('V');
  const [note, setNote] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, form, note }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    const newEntry = { ...data.entry, date: String(data.entry.date).slice(0, 10) };
    setEntries((prev) => [...prev.filter((x) => x.id !== newEntry.id), newEntry].sort((a, b) => a.date.localeCompare(b.date)));
    setDate('');
    setNote('');
  }

  async function cancelEntry(id: string) {
    await fetch('/api/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setEntries((prev) => prev.filter((e) => e.id !== id));
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
    return <p>Could not load your account. Contact the admin.</p>;
  }

  if (teacher.must_change_password) {
    return (
      <div className="max-w-sm mx-auto mt-10">
        <h1 className="text-xl font-semibold mb-2">Set a new password</h1>
        <p className="text-sm text-muted mb-4">
          This is your first login. Please set a password only you know.
        </p>
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded border border-line px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded bg-sage text-paper py-2">Save password</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Welcome, {teacher.name}</h1>
        <div className="flex gap-3 text-sm">
          {teacher.is_admin && <a href="/admin" className="text-sage hover:underline">Admin panel</a>}
          <button onClick={logout} className="text-muted hover:underline">Log out</button>
        </div>
      </div>

      <form onSubmit={addEntry} className="bg-white border rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-line px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Form</label>
          <select value={form} onChange={(e) => setForm(e.target.value as 'V' | 'VI')} className="rounded border border-line px-3 py-2">
            <option value="V">Form V</option>
            <option value="VI">Form VI</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded border border-line px-3 py-2"
            placeholder="e.g. covering half session"
          />
        </div>
        <button className="rounded bg-sage text-paper px-4 py-2">Mark as teaching</button>
      </form>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <h2 className="font-medium mb-2">Your upcoming nights</h2>
      <div className="space-y-2">
        {entries.length === 0 && <p className="text-sm text-muted">Nothing scheduled yet.</p>}
        {entries.map((e) => (
          <div key={e.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-medium">{e.date}</span> — Form {e.form}
              {e.note && <span className="text-muted/70"> ({e.note})</span>}
            </div>
            <button onClick={() => cancelEntry(e.id)} className="text-sm text-red-600 hover:underline">
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Teacher = { id: string; name: string; email: string; is_admin: boolean };
type Entry = {
  id: string;
  date: string;
  form: string;
  status: string;
  note: string | null;
  teacher_name: string;
};

export default function AdminClient({
  teachers: initialTeachers,
  entries: initialEntries,
  currentTeacherId,
}: {
  teachers: Teacher[];
  entries: Entry[];
  currentTeacherId: string;
}) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [entries, setEntries] = useState(
    initialEntries.map((e) => ({ ...e, date: String(e.date).slice(0, 10) }))
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTeachers(initialTeachers);
  }, [initialTeachers]);

  useEffect(() => {
    setEntries(
      initialEntries.map((e) => ({ ...e, date: String(e.date).slice(0, 10) }))
    );
  }, [initialEntries]);

  async function addTeacher(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    const res = await fetch('/api/admin/create-teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    setMsg(`${name} added. Share their email and temporary password with them.`);
    setName('');
    setEmail('');
    setPassword('');
    router.refresh();
  }

  async function removeEntry(id: string, label: string) {
    if (!window.confirm(`Remove ${label} from the schedule?`)) return;

    await fetch('/api/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setMsg('Schedule entry removed.');
  }

  async function removeTeacher(t: Teacher) {
    if (t.id === currentTeacherId) {
      setError("You can't remove your own account.");
      return;
    }
    if (
      !window.confirm(
        `Remove ${t.name}? Their upcoming schedule entries will also be deleted.`
      )
    ) {
      return;
    }

    setError('');
    setMsg('');
    const res = await fetch('/api/admin/delete-teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Failed to remove teacher');
      return;
    }

    setTeachers((prev) => prev.filter((x) => x.id !== t.id));
    setEntries((prev) => prev.filter((e) => e.teacher_name !== t.name));
    setMsg(`${t.name} removed.`);
    router.refresh();
  }

  function startEdit(t: Teacher) {
    setEditingId(t.id);
    setEditName(t.name);
    setEditEmail(t.email);
    setEditError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError('');
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    setEditError('');

    const res = await fetch('/api/admin/edit-teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName, email: editEmail }),
    });
    const data = await res.json();
    setEditSaving(false);

    if (!res.ok) {
      setEditError(data.error ?? 'Something went wrong');
      return;
    }

    setTeachers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: editName, email: editEmail.toLowerCase() } : t
      )
    );
    setEditingId(null);
    setMsg('Teacher updated.');
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-muted mb-1">Administration</p>
        <h1 className="font-display text-2xl sm:text-3xl text-ink tracking-tight">
          Admin panel
        </h1>
      </div>

      {msg && (
        <p className="text-sm text-sage bg-sage/10 rounded-lg px-3 py-2 mb-4">{msg}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      <section className="bg-white border border-line rounded-xl p-5 mb-6 shadow-sm">
        <h2 className="font-medium text-ink mb-4">Add a teacher</h2>
        <form onSubmit={addTeacher} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm text-muted mb-1.5">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Temporary password</label>
            <input
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>
          <button
            disabled={loading}
            className="rounded-lg bg-sage text-paper px-4 py-2 font-medium hover:bg-sage/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding…' : 'Add teacher'}
          </button>
        </form>
      </section>

      <section className="bg-white border border-line rounded-xl p-5 mb-6 shadow-sm">
        <h2 className="font-medium text-ink mb-4">Teachers ({teachers.length})</h2>
        <div className="space-y-3">
          {teachers.map((t) => (
            <div key={t.id} className="text-sm border-b border-line last:border-0 pb-3 last:pb-0">
              {editingId === t.id ? (
                <div className="flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="block text-xs text-muted mb-1">Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg border border-line px-2 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="rounded-lg border border-line px-2 py-1.5"
                    />
                  </div>
                  <button
                    onClick={() => saveEdit(t.id)}
                    disabled={editSaving}
                    className="rounded-lg bg-sage text-paper px-3 py-1.5 disabled:opacity-50"
                  >
                    {editSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={cancelEdit} className="text-muted px-2 py-1.5">
                    Cancel
                  </button>
                  {editError && (
                    <p className="text-xs text-red-600 w-full">{editError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-medium text-ink">{t.name}</span>
                    {t.is_admin && (
                      <span className="text-xs text-sage ml-1.5">(admin)</span>
                    )}
                    <span className="text-muted/70 block sm:inline sm:ml-1 truncate">
                      {t.email}
                    </span>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => startEdit(t)}
                      className="text-sage hover:underline"
                    >
                      Edit
                    </button>
                    {!t.is_admin && t.id !== currentTeacherId && (
                      <button
                        onClick={() => removeTeacher(t)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-line rounded-xl p-5 shadow-sm">
        <h2 className="font-medium text-ink mb-4">Upcoming schedule (all teachers)</h2>
        <div className="space-y-2">
          {entries.length === 0 && (
            <p className="text-sm text-muted italic text-center py-4">No entries yet.</p>
          )}
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 text-sm border-b border-line last:border-0 pb-2 last:pb-0"
            >
              <div className="min-w-0">
                <span className="font-medium">{e.date}</span>
                <span className="text-muted">
                  {' '}— Form {e.form} — {e.teacher_name}
                </span>
                {e.note && <span className="text-muted/70"> ({e.note})</span>}
              </div>
              <button
                onClick={() =>
                  removeEntry(e.id, `Form ${e.form} on ${e.date} (${e.teacher_name})`)
                }
                className="text-red-600 hover:underline shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

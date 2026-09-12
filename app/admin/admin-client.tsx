'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Teacher = { id: string; name: string; email: string; is_admin: boolean };
type Entry = { id: string; date: string; form: string; status: string; note: string | null; teacher_name: string };

export default function AdminClient({ teachers: initialTeachers, entries }: { teachers: Teacher[]; entries: Entry[] }) {
  const [teachers, setTeachers] = useState(initialTeachers);
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

  async function removeEntry(id: string) {
    await fetch('/api/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
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
      prev.map((t) => (t.id === id ? { ...t, name: editName, email: editEmail.toLowerCase() } : t))
    );
    setEditingId(null);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Admin Panel</h1>

      <section className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-medium mb-3">Add a teacher</h2>
        <form onSubmit={addTeacher} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-line px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded border border-line px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Temporary password</label>
            <input required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded border border-line px-3 py-2" />
          </div>
          <button disabled={loading} className="rounded bg-sage text-paper px-4 py-2 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add teacher'}
          </button>
        </form>
        {msg && <p className="text-sm text-green-600 mt-2">{msg}</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </section>

      <section className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-medium mb-3">Teachers ({teachers.length})</h2>
        <div className="space-y-2">
          {teachers.map((t) => (
            <div key={t.id} className="text-sm border-b pb-2">
              {editingId === t.id ? (
                <div className="flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="block text-xs mb-1">Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded border border-line px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="rounded border border-line px-2 py-1"
                    />
                  </div>
                  <button
                    onClick={() => saveEdit(t.id)}
                    disabled={editSaving}
                    className="rounded bg-sage text-paper px-3 py-1 disabled:opacity-50"
                  >
                    {editSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={cancelEdit} className="text-muted px-2 py-1">
                    Cancel
                  </button>
                  {editError && <p className="text-xs text-red-600 w-full">{editError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    {t.name} {t.is_admin && <span className="text-xs text-sage">(admin)</span>}
                    <span className="text-muted/70"> — {t.email}</span>
                  </div>
                  <button onClick={() => startEdit(t)} className="text-sage hover:underline">
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4">
        <h2 className="font-medium mb-3">Upcoming schedule (all teachers)</h2>
        <div className="space-y-2">
          {entries.length === 0 && <p className="text-sm text-muted">No entries yet.</p>}
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-sm border-b pb-1">
              <div>
                <span className="font-medium">{String(e.date).slice(0, 10)}</span> — Form {e.form} — {e.teacher_name}
                {e.note && <span className="text-muted/70"> ({e.note})</span>}
              </div>
              <button onClick={() => removeEntry(e.id)} className="text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

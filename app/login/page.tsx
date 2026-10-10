'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <p className="text-sm text-muted mb-1.5 tracking-wide">Teachers</p>
        <h1 className="font-display text-3xl text-ink tracking-tight">Sign in</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-line rounded-xl p-6 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-sm text-muted mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sage text-paper py-2.5 font-medium hover:bg-sage/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Log in'}
        </button>
      </form>

      <p className="text-xs text-muted mt-4 text-center leading-relaxed">
        Accounts are created by the admin. If you don&apos;t have login details, ask the admin.
      </p>
    </div>
  );
}

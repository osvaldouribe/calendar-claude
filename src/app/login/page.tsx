'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) { setError('Invalid email or password.'); setLoading(false); }
    else { router.push('/'); router.refresh(); }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-stone-300 text-2xl mb-3">◎</p>
          <h1 className="text-2xl text-stone-800 mb-1"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
            Welcome back
          </h1>
          <p className="text-xs text-stone-400 tracking-widest uppercase"
            style={{ fontFamily: "'DM Sans', system-ui" }}>Cosmic Calendar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'email',    type: 'email',    val: email,    set: setEmail,    label: 'Email',    ph: 'you@example.com' },
            { id: 'password', type: 'password', val: password, set: setPassword, label: 'Password', ph: '••••••••' },
          ].map(({ id, type, val, set, label, ph }) => (
            <div key={id}>
              <label htmlFor={id}
                className="block text-xs tracking-widest uppercase text-stone-400 mb-2"
                style={{ fontFamily: "'DM Sans', system-ui" }}>{label}</label>
              <input id={id} type={type} value={val} required placeholder={ph}
                onChange={(e) => set(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-700 bg-white focus:outline-none focus:border-stone-400 placeholder:text-stone-300 transition-colors"
                style={{ fontFamily: "'DM Sans', system-ui" }} />
            </div>
          ))}
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-stone-800 text-white rounded-lg py-3 text-sm tracking-wide hover:bg-stone-700 disabled:opacity-50 transition-colors mt-2"
            style={{ fontFamily: "'DM Sans', system-ui" }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-xs text-stone-400 mt-6"
          style={{ fontFamily: "'DM Sans', system-ui" }}>
          No account?{' '}
          <Link href="/signup" className="text-stone-600 hover:text-stone-800 underline underline-offset-2">Join</Link>
        </p>
        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-stone-300 hover:text-stone-500 transition-colors">← Back to calendar</Link>
        </div>
      </div>
    </div>
  );
}
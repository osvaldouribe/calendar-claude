'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setErrors(data.error ?? {}); setLoading(false); return; }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/'); router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-stone-300 text-2xl mb-3">◎</p>
          <h1 className="text-2xl text-stone-800 mb-1"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
            Begin your year
          </h1>
          <p className="text-xs text-stone-400 tracking-widest uppercase"
            style={{ fontFamily: "'DM Sans', system-ui" }}>Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name'     as const, label: 'Name',     type: 'text',     ph: 'Your name',        req: false },
            { key: 'email'    as const, label: 'Email',    type: 'email',    ph: 'you@example.com',  req: true  },
            { key: 'password' as const, label: 'Password', type: 'password', ph: 'Min. 8 characters', req: true  },
          ].map(({ key, label, type, ph, req }) => (
            <div key={key}>
              <label htmlFor={key}
                className="block text-xs tracking-widest uppercase text-stone-400 mb-2"
                style={{ fontFamily: "'DM Sans', system-ui" }}>{label}</label>
              <input id={key} type={type} required={req} placeholder={ph}
                value={form[key]}
                onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-700 bg-white focus:outline-none focus:border-stone-400 placeholder:text-stone-300 transition-colors"
                style={{ fontFamily: "'DM Sans', system-ui" }} />
              {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key][0]}</p>}
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-stone-800 text-white rounded-lg py-3 text-sm tracking-wide hover:bg-stone-700 disabled:opacity-50 transition-colors mt-2"
            style={{ fontFamily: "'DM Sans', system-ui" }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-xs text-stone-400 mt-6"
          style={{ fontFamily: "'DM Sans', system-ui" }}>
          Already have an account?{' '}
          <Link href="/login" className="text-stone-600 hover:text-stone-800 underline underline-offset-2">Sign in</Link>
        </p>
        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-stone-300 hover:text-stone-500 transition-colors">← Back to calendar</Link>
        </div>
      </div>
    </div>
  );
}
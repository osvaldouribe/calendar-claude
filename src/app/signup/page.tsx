'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]   = useState<Record<string, string[]>>({});
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
    router.push('/login?welcome=1');
  };

  const fields = [
    { key: 'name'     as const, label: 'Name',     type: 'text',     ph: 'Your name' },
    { key: 'email'    as const, label: 'Email',    type: 'email',    ph: 'you@example.com' },
    { key: 'password' as const, label: 'Password', type: 'password', ph: 'Min. 8 characters' },
  ];

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-cream)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'var(--font-inter)',
    }}>
      {/* Logo row */}
      <Link href="/" style={{ textDecoration: 'none', marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', color: 'var(--ink-light)', lineHeight: 1 }}>◎</div>
        <div style={{
          fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--ink-light)', marginTop: '8px', fontFamily: 'var(--font-inter)',
        }}>Cosmic Calendar</div>
      </Link>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '360px',
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '36px 32px',
        boxShadow: '0 2px 24px rgba(0,0,0,0.04)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          fontSize: '26px', color: 'var(--ink)',
          margin: '0 0 6px', textAlign: 'center',
        }}>
          Begin your year
        </h1>
        <p style={{
          fontSize: '12px', color: 'var(--ink-light)',
          textAlign: 'center', margin: '0 0 28px',
          fontFamily: 'var(--font-inter)',
        }}>
          Create your account
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {fields.map(({ key, label, type, ph }) => (
            <div key={key}>
              <label htmlFor={key} style={{
                display: 'block', fontSize: '10px', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--ink-light)',
                marginBottom: '6px', fontFamily: 'var(--font-inter)',
              }}>{label}</label>
              <input
                id={key} type={type} required placeholder={ph}
                value={form[key]}
                onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                style={{
                  width: '100%', padding: '11px 14px',
                  border: `1px solid ${errors[key] ? '#FCA5A5' : 'var(--border)'}`,
                  borderRadius: '8px', fontSize: '14px',
                  color: 'var(--ink)', background: '#FAFAF9',
                  fontFamily: 'var(--font-inter)', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#A8A29E'}
                onBlur={e  => e.target.style.borderColor = errors[key] ? '#FCA5A5' : 'var(--border)'}
              />
              {errors[key] && (
                <p style={{ fontSize: '11px', color: '#DC2626', margin: '4px 0 0' }}>
                  {errors[key][0]}
                </p>
              )}
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            background: loading ? 'var(--ink-mid)' : 'var(--ink)',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '13px', letterSpacing: '0.04em',
            fontFamily: 'var(--font-inter)', cursor: loading ? 'default' : 'pointer',
            transition: 'background 0.15s', marginTop: '4px',
          }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      <p style={{
        marginTop: '20px', fontSize: '13px',
        color: 'var(--ink-light)', fontFamily: 'var(--font-inter)',
      }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}

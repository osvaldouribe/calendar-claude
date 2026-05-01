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
          Welcome back
        </h1>
        <p style={{
          fontSize: '12px', color: 'var(--ink-light)',
          textAlign: 'center', margin: '0 0 28px',
          fontFamily: 'var(--font-inter)',
        }}>
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { id: 'email',    type: 'email',    val: email,    set: setEmail,    label: 'Email',    ph: 'you@example.com' },
            { id: 'password', type: 'password', val: password, set: setPassword, label: 'Password', ph: '••••••••' },
          ].map(({ id, type, val, set, label, ph }) => (
            <div key={id}>
              <label htmlFor={id} style={{
                display: 'block', fontSize: '10px', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--ink-light)',
                marginBottom: '6px', fontFamily: 'var(--font-inter)',
              }}>{label}</label>
              <input
                id={id} type={type} value={val} required placeholder={ph}
                onChange={(e) => set(e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  fontSize: '14px', color: 'var(--ink)', background: '#FAFAF9',
                  fontFamily: 'var(--font-inter)', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#A8A29E'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}

          {error && (
            <p style={{
              fontSize: '12px', color: '#B45309',
              background: '#FEF3C7', border: '1px solid #FDE68A',
              borderRadius: '8px', padding: '8px 12px', margin: 0,
            }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            background: loading ? 'var(--ink-mid)' : 'var(--ink)',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '13px', letterSpacing: '0.04em',
            fontFamily: 'var(--font-inter)', cursor: loading ? 'default' : 'pointer',
            transition: 'background 0.15s', marginTop: '4px',
          }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p style={{
        marginTop: '20px', fontSize: '13px',
        color: 'var(--ink-light)', fontFamily: 'var(--font-inter)',
      }}>
        No account?{' '}
        <Link href="/signup" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
          Join
        </Link>
      </p>
    </div>
  );
}

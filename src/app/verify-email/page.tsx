'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyContent() {
  const params  = useSearchParams();
  const success = params.get('success') === '1';
  const error   = params.get('error');

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-cream)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'var(--font-inter)',
    }}>
      <Link href="/" style={{ textDecoration: 'none', marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', color: 'var(--ink-light)', lineHeight: 1 }}>◎</div>
        <div style={{
          fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--ink-light)', marginTop: '8px',
        }}>Cosmic Calendar</div>
      </Link>

      <div style={{
        width: '100%', maxWidth: '360px',
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '36px 32px',
        boxShadow: '0 2px 24px rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: success ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${success ? '#BBF7D0' : '#FECACA'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', margin: '0 auto 20px',
        }}>
          {success ? '✓' : '✕'}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          fontSize: '26px', color: 'var(--ink)',
          margin: '0 0 12px',
        }}>
          {success ? 'Email confirmed' : error === 'expired' ? 'Link expired' : 'Invalid link'}
        </h1>

        <p style={{
          fontSize: '14px', color: 'var(--ink-mid)',
          lineHeight: 1.6, margin: '0 0 28px',
        }}>
          {success
            ? 'Your account is verified. You\'re ready to begin.'
            : error === 'expired'
            ? 'This link has expired. Sign up again to get a fresh verification email.'
            : 'This link is invalid or has already been used.'}
        </p>

        <Link href={success ? '/login' : '/signup'} style={{
          display: 'block', width: '100%',
          padding: '13px', background: 'var(--ink)',
          color: '#fff', borderRadius: '8px',
          fontSize: '13px', letterSpacing: '0.04em',
          textDecoration: 'none', textAlign: 'center',
          boxSizing: 'border-box',
        }}>
          {success ? 'Sign in' : 'Back to sign up'}
        </Link>
      </div>

      <Link href="/" style={{
        marginTop: '20px', fontSize: '12px',
        color: 'var(--ink-light)', textDecoration: 'none',
      }}>
        ← Back to calendar
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}

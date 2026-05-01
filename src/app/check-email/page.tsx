import Link from 'next/link';

export default function CheckEmailPage({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email ?? '';

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
        {/* Envelope glyph */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'var(--bg-cream)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', margin: '0 auto 20px',
        }}>✉</div>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          fontSize: '26px', color: 'var(--ink)',
          margin: '0 0 10px',
        }}>
          Check your email
        </h1>

        <p style={{
          fontSize: '14px', color: 'var(--ink-mid)',
          lineHeight: 1.6, margin: '0 0 6px',
        }}>
          We sent a confirmation link to
        </p>
        {email && (
          <p style={{
            fontSize: '14px', color: 'var(--ink)',
            fontWeight: 500, margin: '0 0 20px',
            wordBreak: 'break-all',
          }}>
            {email}
          </p>
        )}
        <p style={{
          fontSize: '12px', color: 'var(--ink-light)',
          lineHeight: 1.6, margin: '0 0 28px',
        }}>
          Click the link to verify your account and start your journey.
          The link expires in 24 hours — check your spam folder if you don&apos;t see it.
        </p>

        <Link href="/login" style={{
          display: 'block', width: '100%',
          padding: '13px', background: 'var(--ink)',
          color: '#fff', borderRadius: '8px',
          fontSize: '13px', letterSpacing: '0.04em',
          textDecoration: 'none', textAlign: 'center',
          boxSizing: 'border-box',
        }}>
          Go to sign in
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

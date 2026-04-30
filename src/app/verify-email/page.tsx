'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyContent() {
  const params = useSearchParams();
  const success = params.get('success') === '1';
  const error   = params.get('error');

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <p className="text-stone-300 text-2xl mb-3">◎</p>

        {success ? (
          <>
            <h1 className="text-2xl text-stone-800 mb-2"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
              Email confirmed
            </h1>
            <p className="text-xs text-stone-400 tracking-widest uppercase mb-8"
              style={{ fontFamily: "'DM Sans', system-ui" }}>
              Cosmic Calendar
            </p>
            <div className="bg-white border border-stone-100 rounded-2xl px-8 py-8 mb-6">
              <p className="text-sm text-stone-600 leading-relaxed"
                style={{ fontFamily: "'DM Sans', system-ui" }}>
                Your account is verified. You&apos;re ready to begin.
              </p>
            </div>
            <Link href="/login"
              className="block w-full bg-stone-800 text-white rounded-lg py-3 text-sm tracking-wide hover:bg-stone-700 transition-colors mb-4"
              style={{ fontFamily: "'DM Sans', system-ui" }}>
              Sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl text-stone-800 mb-2"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
              {error === 'expired' ? 'Link expired' : 'Invalid link'}
            </h1>
            <p className="text-xs text-stone-400 tracking-widest uppercase mb-8"
              style={{ fontFamily: "'DM Sans', system-ui" }}>
              Cosmic Calendar
            </p>
            <div className="bg-white border border-stone-100 rounded-2xl px-8 py-8 mb-6">
              <p className="text-sm text-stone-600 leading-relaxed"
                style={{ fontFamily: "'DM Sans', system-ui" }}>
                {error === 'expired'
                  ? 'This verification link has expired. Please create a new account to receive a fresh link.'
                  : 'This link is invalid or has already been used.'}
              </p>
            </div>
            <Link href="/signup"
              className="block w-full bg-stone-800 text-white rounded-lg py-3 text-sm tracking-wide hover:bg-stone-700 transition-colors mb-4"
              style={{ fontFamily: "'DM Sans', system-ui" }}>
              Back to sign up
            </Link>
          </>
        )}

        <div className="text-center">
          <Link href="/" className="text-xs text-stone-300 hover:text-stone-500 transition-colors">
            ← Back to calendar
          </Link>
        </div>
      </div>
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

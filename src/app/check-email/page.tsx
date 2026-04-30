import Link from 'next/link';

export default function CheckEmailPage({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email ?? 'your inbox';

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <p className="text-stone-300 text-2xl mb-3">◎</p>
        <h1 className="text-2xl text-stone-800 mb-2"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
          Check your email
        </h1>
        <p className="text-xs text-stone-400 tracking-widest uppercase mb-8"
          style={{ fontFamily: "'DM Sans', system-ui" }}>
          Cosmic Calendar
        </p>

        <div className="bg-white border border-stone-100 rounded-2xl px-8 py-8 mb-6 text-left">
          <p className="text-sm text-stone-600 leading-relaxed mb-4"
            style={{ fontFamily: "'DM Sans', system-ui" }}>
            We sent a confirmation link to{' '}
            <span className="text-stone-800 font-medium">{email}</span>.
            Click it to verify your account and begin your journey.
          </p>
          <p className="text-xs text-stone-400 leading-relaxed"
            style={{ fontFamily: "'DM Sans', system-ui" }}>
            The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
          </p>
        </div>

        <p className="text-center text-xs text-stone-400 mb-4"
          style={{ fontFamily: "'DM Sans', system-ui" }}>
          Already verified?{' '}
          <Link href="/login" className="text-stone-600 hover:text-stone-800 underline underline-offset-2">
            Sign in
          </Link>
        </p>
        <div className="text-center">
          <Link href="/" className="text-xs text-stone-300 hover:text-stone-500 transition-colors">
            ← Back to calendar
          </Link>
        </div>
      </div>
    </div>
  );
}

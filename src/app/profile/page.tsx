import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-stone-300 text-2xl mb-3">◎</p>
          <h1 className="text-2xl text-stone-800 mb-1"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 300 }}>
            Your profile
          </h1>
          <p className="text-xs text-stone-400 tracking-widest uppercase"
            style={{ fontFamily: "'DM Sans', system-ui" }}>{session.user.email}</p>
        </div>
        <ProfileForm initialData={{
          name:      profile?.name ?? '',
          birthDate: profile?.birthDate?.toISOString().split('T')[0] ?? '',
          interests: profile?.interests ?? '',
          timezone:  profile?.timezone ?? 'UTC',
        }} />
      </div>
    </div>
  );
}
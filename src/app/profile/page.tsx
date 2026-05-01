import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileClient from '@/components/ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [profile, importantDates] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.importantDate.findMany({
      where:   { userId: session.user.id },
      orderBy: [{ month: 'asc' }, { day: 'asc' }],
    }),
  ]);

  return (
    <ProfileClient
      userEmail={session.user.email ?? ''}
      userName={session.user.name ?? ''}
      initialProfile={{
        name:       profile?.name ?? '',
        birthDate:  profile?.birthDate?.toISOString().split('T')[0] ?? '',
        hemisphere: (profile?.hemisphere ?? 'north') as 'north' | 'south',
      }}
      initialDates={importantDates.map((d) => ({
        id: d.id, label: d.label, month: d.month, day: d.day, year: d.year ?? null,
      }))}
    />
  );
}

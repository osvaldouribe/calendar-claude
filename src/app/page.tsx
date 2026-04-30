import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayInfo, ZODIAC_SIGNS, FULL_MOONS } from '@/lib/cosmic-data';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  const today   = new Date();

  let hemisphere: 'north' | 'south' = 'north';
  let events: Array<{
    id: string; title: string; date: string;
    description: string | null; color: string | null;
  }> = [];

  if (session?.user?.id) {
    const [raw, profile] = await Promise.all([
      prisma.event.findMany({ where: { userId: session.user.id }, orderBy: { date: 'asc' } }),
      prisma.profile.findUnique({ where: { userId: session.user.id }, select: { hemisphere: true } }),
    ]);
    events = raw.map((e) => ({
      id: e.id, title: e.title,
      date: e.date.toISOString(),
      description: e.description,
      color: e.color,
    }));
    if (profile?.hemisphere === 'south') hemisphere = 'south';
  }

  const todayInfo = getTodayInfo(today, hemisphere);

  return (
    <DashboardClient
      today={today.toISOString()}
      todayInfo={todayInfo}
      events={events}
      zodiacSigns={ZODIAC_SIGNS}
      fullMoons={FULL_MOONS}
      isLoggedIn={!!session?.user}
      userEmail={session?.user?.email ?? null}
      userName={session?.user?.name ?? null}
    />
  );
}

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayInfo, ZODIAC_SIGNS, FULL_MOONS } from '@/lib/cosmic-data';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  const today   = new Date();
  const year    = today.getFullYear();

  let hemisphere: 'north' | 'south' = 'north';
  let events: Array<{
    id: string; title: string; date: string;
    description: string | null; color: string | null;
  }> = [];

  if (session?.user?.id) {
    const [rawEvents, profile, importantDates] = await Promise.all([
      prisma.event.findMany({ where: { userId: session.user.id }, orderBy: { date: 'asc' } }),
      prisma.profile.findUnique({
        where:  { userId: session.user.id },
        select: { hemisphere: true, birthDate: true, name: true },
      }),
      prisma.importantDate.findMany({ where: { userId: session.user.id } }),
    ]);

    if (profile?.hemisphere === 'south') hemisphere = 'south';

    // User-marked events
    events = rawEvents.map(e => ({
      id: e.id, title: e.title,
      date: e.date.toISOString(),
      description: e.description, color: e.color,
    }));

    // Birthdate → this year's occurrence
    if (profile?.birthDate) {
      const bd = profile.birthDate;
      const thisYear = new Date(year, bd.getMonth(), bd.getDate());
      events.push({
        id:          '__birthday__',
        title:       'Birthday' + (profile.name ? ` · ${profile.name}` : ''),
        date:        thisYear.toISOString(),
        description: null, color: null,
      });
    }

    // Important dates → this year's occurrences
    for (const d of importantDates) {
      const thisYear = new Date(year, d.month - 1, d.day);
      events.push({
        id:          d.id,
        title:       d.label,
        date:        thisYear.toISOString(),
        description: d.year ? `Since ${d.year} · ${year - d.year} years` : null,
        color:       null,
      });
    }
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

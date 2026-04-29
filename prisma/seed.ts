import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('demo1234', 12);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@cosmiccalendar.app' },
    update: {},
    create: {
      email: 'demo@cosmiccalendar.app',
      name: 'Demo User',
      password: hashedPassword,
      profile: {
        create: {
          name: 'Demo User',
          interests: 'Astronomy, seasonal rhythms, mindfulness',
          timezone: 'America/New_York',
        },
      },
      events: {
        create: [
          {
            title: 'Spring Equinox Ritual',
            date: new Date('2026-03-20'),
            description: 'Celebrate the return of light. Set intentions for the growing season.',
            color: '#7A9B6A',
          },
          {
            title: 'Full Moon Walk',
            date: new Date('2026-04-02'),
            description: 'Evening walk under the Pink Moon.',
            color: '#C8B89A',
          },
          {
            title: 'Summer Solstice',
            date: new Date('2026-06-21'),
            description: 'Longest day. Peak solar energy.',
            color: '#D4956A',
          },
        ],
      },
    },
  });

  console.log(`✅ Created demo user: ${demo.email}`);
  console.log('🌙 Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
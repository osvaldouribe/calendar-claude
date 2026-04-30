import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ProfileSchema = z.object({
  name:       z.string().max(100).optional(),
  birthDate:  z.string().optional(),
  interests:  z.string().max(2000).optional(),
  timezone:   z.string().max(100).optional(),
  hemisphere: z.enum(['north', 'south']).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = ProfileSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, birthDate, interests, timezone, hemisphere } = parsed.data;
  const profile = await prisma.profile.upsert({
    where:  { userId: session.user.id },
    update: {
      name:       name ?? null,
      birthDate:  birthDate ? new Date(birthDate) : null,
      interests:  interests ?? null,
      timezone:   timezone ?? 'UTC',
      hemisphere: hemisphere ?? 'north',
    },
    create: {
      userId:     session.user.id,
      name:       name ?? null,
      birthDate:  birthDate ? new Date(birthDate) : null,
      interests:  interests ?? null,
      timezone:   timezone ?? 'UTC',
      hemisphere: hemisphere ?? 'north',
    },
  });
  return NextResponse.json(profile);
}

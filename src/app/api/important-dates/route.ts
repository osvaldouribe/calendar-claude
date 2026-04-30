import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateSchema = z.object({
  label: z.string().min(1).max(100),
  month: z.number().int().min(1).max(12),
  day:   z.number().int().min(1).max(31),
  year:  z.number().int().min(1900).max(2100).nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dates = await prisma.importantDate.findMany({
    where:   { userId: session.user.id },
    orderBy: [{ month: 'asc' }, { day: 'asc' }],
  });
  return NextResponse.json(dates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const date = await prisma.importantDate.create({
    data: { ...parsed.data, year: parsed.data.year ?? null, userId: session.user.id },
  });
  return NextResponse.json(date, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const existing = await prisma.importantDate.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.importantDate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

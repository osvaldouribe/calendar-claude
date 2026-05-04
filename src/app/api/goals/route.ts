import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  targetMonth: z.number().int().min(1).max(12),
  targetDay:   z.number().int().min(1).max(31),
  targetYear:  z.number().int().min(2000).max(2100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where:   { userId: session.user.id },
    orderBy: [{ targetYear: 'asc' }, { targetMonth: 'asc' }, { targetDay: 'asc' }],
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const goal = await prisma.goal.create({
    data: { ...parsed.data, description: parsed.data.description ?? null, userId: session.user.id },
  });
  return NextResponse.json(goal, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const existing = await prisma.goal.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

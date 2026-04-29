import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateSchema = z.object({
  title:       z.string().min(1).max(200),
  date:        z.string().refine((d) => !isNaN(Date.parse(d))),
  description: z.string().max(2000).optional(),
  color:       z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const events = await prisma.event.findMany({
    where: { userId: session.user.id }, orderBy: { date: 'asc' },
  });
  return NextResponse.json(events.map((e) => ({ ...e, date: e.date.toISOString() })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { title, date, description, color } = parsed.data;
  const event = await prisma.event.create({
    data: { title, date: new Date(date), description: description ?? null, color: color ?? '#6B7280', userId: session.user.id },
  });
  return NextResponse.json({ ...event, date: event.date.toISOString() }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  const existing = await prisma.event.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
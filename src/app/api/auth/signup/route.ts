import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

const SignupSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
  name:     z.string().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = SignupSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: { email: ['Email already in use'] } }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name: name ?? null, password: hashed, profile: { create: { name: name ?? null } } },
  });
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
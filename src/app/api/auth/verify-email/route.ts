import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(new URL('/login?error=invalid', req.url));

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    if (record) await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(new URL('/verify-email?error=expired', req.url));
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data:  { emailVerified: new Date() },
  });
  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL('/verify-email?success=1', req.url));
}

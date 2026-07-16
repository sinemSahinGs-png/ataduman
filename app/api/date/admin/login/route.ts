import { NextResponse } from 'next/server';
import {
  checkAdminPassword,
  setAdminSessionCookie,
} from '@/lib/date/admin-auth';
import { getClientIp, rateLimit } from '@/lib/date/rate-limit';
import { loginSchema } from '@/lib/date/validation';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-login:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Çok fazla deneme. Biraz bekleyin.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Şifre gerekli' }, { status: 400 });
  }

  if (!checkAdminPassword(parsed.data.password)) {
    return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
  }

  try {
    await setAdminSessionCookie();
  } catch (error) {
    console.error('[admin-login]', error);
    return NextResponse.json({ error: 'Sunucu yapılandırması eksik' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

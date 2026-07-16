import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_PREFIX = 'date_answered_';

function getSecret(): string {
  return (
    process.env.DATE_ADMIN_SESSION_SECRET ||
    process.env.DATE_ADMIN_PASSWORD ||
    'dev-insecure-fallback-change-me'
  );
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex').slice(0, 24);
}

export function answeredCookieName(slug: string): string {
  return `${COOKIE_PREFIX}${slug}`;
}

export async function setAnsweredCookie(slug: string, selectedDate: string): Promise<void> {
  const jar = await cookies();
  const payload = `${slug}|${selectedDate}|${Date.now()}`;
  const value = `${payload}.${sign(payload)}`;
  jar.set(answeredCookieName(slug), value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function readAnsweredCookie(
  slug: string
): Promise<{ selectedDate: string } | null> {
  const jar = await cookies();
  const raw = jar.get(answeredCookieName(slug))?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const parts = payload.split('|');
  if (parts[0] !== slug || !parts[1]) return null;
  return { selectedDate: parts[1] };
}

export async function clearAnsweredCookie(slug: string): Promise<void> {
  const jar = await cookies();
  jar.set(answeredCookieName(slug), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function newSessionId(): string {
  return randomUUID();
}

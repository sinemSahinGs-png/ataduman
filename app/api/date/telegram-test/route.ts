import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/date/admin-auth';
import { getClientIp, rateLimit } from '@/lib/date/rate-limit';
import { sendTelegramMessage } from '@/lib/date/telegram';

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`telegram-test:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  const ok = await sendTelegramMessage(
    '✅ Test bildirimi\n\nAta Duman date sistemi Telegram bağlantısı çalışıyor.'
  );

  if (!ok) {
    return NextResponse.json({ error: 'Telegram gönderilemedi (sunucu loguna bakın)' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

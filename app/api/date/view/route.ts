import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/date/rate-limit';
import { getInviteBySlug, getSupabaseAdmin } from '@/lib/date/supabase';
import { viewSchema } from '@/lib/date/validation';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`view:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = viewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz slug' }, { status: 400 });
  }

  try {
    const invite = await getInviteBySlug(parsed.data.slug);
    if (!invite) {
      return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();
    await supabase
      .from('date_invites')
      .update({
        view_count: (invite.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', invite.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[view]', error);
    return NextResponse.json({ ok: true });
  }
}

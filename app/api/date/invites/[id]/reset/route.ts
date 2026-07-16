import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/date/admin-auth';
import { clearAnsweredCookie } from '@/lib/date/response-cookie';
import { getClientIp, rateLimit } from '@/lib/date/rate-limit';
import { getSupabaseAdmin } from '@/lib/date/supabase';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { id } = await context.params;
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-reset:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: invite } = await supabase
      .from('date_invites')
      .select('slug')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('date_responses').delete().eq('invite_id', id);
    if (error) throw error;

    if (invite?.slug) {
      await clearAnsweredCookie(invite.slug);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[invites reset]', error);
    return NextResponse.json({ error: 'Sıfırlanamadı' }, { status: 500 });
  }
}

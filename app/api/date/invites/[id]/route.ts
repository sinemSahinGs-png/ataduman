import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/date/admin-auth';
import { clearAnsweredCookie } from '@/lib/date/response-cookie';
import { getClientIp, rateLimit } from '@/lib/date/rate-limit';
import { getSupabaseAdmin } from '@/lib/date/supabase';
import { invitePatchSchema } from '@/lib/date/validation';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { id } = await context.params;
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-patch:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = invitePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Doğrulama hatası' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('date_invites')
      .update(parsed.data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Bu URL uzantısı zaten kullanılıyor' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ invite: data });
  } catch (error) {
    console.error('[invites PATCH]', error);
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { id } = await context.params;
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-delete:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from('date_invites')
      .select('slug')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('date_invites').delete().eq('id', id);
    if (error) throw error;

    if (existing?.slug) {
      await clearAnsweredCookie(existing.slug);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[invites DELETE]', error);
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}

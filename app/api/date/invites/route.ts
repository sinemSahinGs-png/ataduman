import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/date/admin-auth';
import { getClientIp, rateLimit } from '@/lib/date/rate-limit';
import { getSupabaseAdmin, listInvitesWithResponses } from '@/lib/date/supabase';
import { inviteUpsertSchema } from '@/lib/date/validation';

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`admin-list:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  try {
    const invites = await listInvitesWithResponses();
    return NextResponse.json({ invites });
  } catch (error) {
    console.error('[invites GET]', error);
    return NextResponse.json({ error: 'Veriler alınamadı' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`admin-create:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = inviteUpsertSchema.safeParse(body);
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
      .insert({
        name: parsed.data.name,
        honorific: parsed.data.honorific,
        male_name: parsed.data.male_name,
        slug: parsed.data.slug,
        custom_question: parsed.data.custom_question,
        is_active: parsed.data.is_active,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Bu URL uzantısı zaten kullanılıyor' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ invite: data }, { status: 201 });
  } catch (error) {
    console.error('[invites POST]', error);
    return NextResponse.json({ error: 'Kayıt oluşturulamadı' }, { status: 500 });
  }
}

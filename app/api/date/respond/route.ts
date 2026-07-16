import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientIp, rateLimit } from '@/lib/date/rate-limit';
import { setAnsweredCookie } from '@/lib/date/response-cookie';
import { getInviteBySlug, getResponseForInvite, getSupabaseAdmin } from '@/lib/date/supabase';
import {
  buildAcceptanceTelegramMessage,
  sendTelegramMessage,
} from '@/lib/date/telegram';
import {
  formatTurkishDate,
  formatTurkishDateTime,
  isPastDate,
} from '@/lib/date/utils';
import { respondSchema } from '@/lib/date/validation';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`respond:${ip}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Çok fazla istek. Lütfen bekleyin.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Doğrulama hatası' },
      { status: 400 }
    );
  }

  const { slug, selected_date, session_id, source } = parsed.data;

  if (isPastDate(selected_date)) {
    return NextResponse.json({ error: 'Geçmiş bir tarih seçilemez' }, { status: 400 });
  }

  try {
    const invite = await getInviteBySlug(slug);
    if (!invite || !invite.is_active) {
      return NextResponse.json({ error: 'Davet bulunamadı veya aktif değil' }, { status: 404 });
    }

    const existing = await getResponseForInvite(invite.id);
    if (existing) {
      await setAnsweredCookie(slug, existing.selected_date);
      return NextResponse.json({
        ok: true,
        already: true,
        selected_date: existing.selected_date,
        responded_at: existing.responded_at,
      });
    }

    const jar = await cookies();
    const cookieAnswered = jar.get(`date_answered_${slug}`)?.value;
    if (cookieAnswered) {
      return NextResponse.json({ error: 'Bu davet için zaten cevap verdiniz' }, { status: 409 });
    }

    const supabase = getSupabaseAdmin();
    const userAgent = request.headers.get('user-agent')?.slice(0, 500) || null;
    const respondedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('date_responses')
      .insert({
        invite_id: invite.id,
        answer: 'yes',
        selected_date,
        responded_at: respondedAt,
        user_agent: userAgent,
        source: source || 'web',
        session_id,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        const again = await getResponseForInvite(invite.id);
        if (again) {
          await setAnsweredCookie(slug, again.selected_date);
          return NextResponse.json({
            ok: true,
            already: true,
            selected_date: again.selected_date,
            responded_at: again.responded_at,
          });
        }
      }
      throw error;
    }

    await setAnsweredCookie(slug, selected_date);

    const displayName = `${invite.name} ${invite.honorific}`;
    const telegramText = buildAcceptanceTelegramMessage({
      displayName,
      selectedDateLabel: formatTurkishDate(selected_date),
      respondedAtLabel: formatTurkishDateTime(respondedAt),
    });

    void sendTelegramMessage(telegramText);

    return NextResponse.json({
      ok: true,
      selected_date: data.selected_date,
      responded_at: data.responded_at,
    });
  } catch (error) {
    console.error('[respond]', error);
    return NextResponse.json(
      { error: 'Cevap kaydedilemedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}

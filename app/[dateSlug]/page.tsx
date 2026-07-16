import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DateInviteExperience } from '@/components/date/DateInviteExperience';
import { readAnsweredCookie } from '@/lib/date/response-cookie';
import { getInviteBySlug, getResponseForInvite } from '@/lib/date/supabase';
import { buildQuestion, RESERVED_DATE_SLUGS } from '@/lib/date/utils';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ dateSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dateSlug } = await params;
  if (RESERVED_DATE_SLUGS.has(dateSlug)) {
    return { title: 'Bulunamadı' };
  }

  try {
    const invite = await getInviteBySlug(dateSlug);
    if (!invite) return { title: 'Bulunamadı' };
    return {
      title: `${invite.name} ${invite.honorific} — Date`,
      description: buildQuestion(
        invite.name,
        invite.honorific,
        invite.male_name,
        invite.custom_question
      ),
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: 'Date' };
  }
}

export default async function DateSlugPage({ params }: Props) {
  const { dateSlug } = await params;

  if (RESERVED_DATE_SLUGS.has(dateSlug)) {
    notFound();
  }

  let invite;
  try {
    invite = await getInviteBySlug(dateSlug);
  } catch (error) {
    console.error('[dateSlug]', error);
    notFound();
  }

  if (!invite) {
    notFound();
  }

  const response = await getResponseForInvite(invite.id);
  const cookieAnswered = await readAnsweredCookie(dateSlug);

  return (
    <DateInviteExperience
      invite={invite}
      initialResponse={response}
      cookieAnsweredDate={cookieAnswered?.selectedDate || response?.selected_date || null}
    />
  );
}

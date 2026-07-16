import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type DateInvite = {
  id: string;
  name: string;
  honorific: string;
  male_name: string;
  slug: string;
  custom_question: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  view_count: number;
  last_viewed_at: string | null;
};

export type DateResponse = {
  id: string;
  invite_id: string;
  answer: 'yes';
  selected_date: string;
  responded_at: string;
  user_agent: string | null;
  source: string | null;
  session_id: string | null;
  created_at: string;
};

export type InviteWithResponse = DateInvite & {
  response: DateResponse | null;
};

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}

export async function getInviteBySlug(slug: string): Promise<DateInvite | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('date_invites')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as DateInvite | null;
}

export async function getResponseForInvite(inviteId: string): Promise<DateResponse | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('date_responses')
    .select('*')
    .eq('invite_id', inviteId)
    .maybeSingle();

  if (error) throw error;
  return data as DateResponse | null;
}

export async function listInvitesWithResponses(): Promise<InviteWithResponse[]> {
  const supabase = getSupabaseAdmin();
  const { data: invites, error } = await supabase
    .from('date_invites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const ids = (invites ?? []).map((i) => i.id);
  let responses: DateResponse[] = [];

  if (ids.length) {
    const { data: respData, error: respError } = await supabase
      .from('date_responses')
      .select('*')
      .in('invite_id', ids);
    if (respError) throw respError;
    responses = (respData ?? []) as DateResponse[];
  }

  const byInvite = new Map(responses.map((r) => [r.invite_id, r]));

  return ((invites ?? []) as DateInvite[]).map((invite) => ({
    ...invite,
    response: byInvite.get(invite.id) ?? null,
  }));
}

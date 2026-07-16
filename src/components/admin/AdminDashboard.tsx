'use client';

import { useEffect, useMemo, useState } from 'react';
import type { InviteWithResponse } from '@/lib/date/supabase';
import { buildQuestion, formatTurkishDate, formatTurkishDateTime, slugifyNameToDate } from '@/lib/date/utils';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

type FormState = {
  name: string;
  honorific: string;
  male_name: string;
  slug: string;
  custom_question: string;
  is_active: boolean;
};

const emptyForm = (): FormState => ({
  name: '',
  honorific: 'Hanım',
  male_name: 'Ata Duman',
  slug: '',
  custom_question: '',
  is_active: true,
});

export function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [invites, setInvites] = useState<InviteWithResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<
    null | { type: 'delete' | 'reset'; id: string; title: string; body: string }
  >(null);

  const siteUrl = useMemo(
    () => (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '') || '',
    []
  );

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/date/invites');
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setInvites(data.invites || []);
      setAuthed(true);
    } catch {
      setMessage('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      const me = await fetch('/api/date/admin/me');
      if (!me.ok) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      await refresh();
    })();
  }, []);

  useEffect(() => {
    if (!slugTouched && form.name) {
      setForm((f) => ({ ...f, slug: slugifyNameToDate(f.name) }));
    }
  }, [form.name, slugTouched]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch('/api/date/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error || 'Giriş başarısız');
      return;
    }
    setPassword('');
    setAuthed(true);
    await refresh();
  };

  const logout = async () => {
    await fetch('/api/date/admin/logout', { method: 'POST' });
    setAuthed(false);
    setInvites([]);
  };

  const previewQuestion = buildQuestion(
    form.name || 'İsim',
    form.honorific || 'Hanım',
    form.male_name || 'Ata Duman',
    form.custom_question || null
  );

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const payload = {
      name: form.name,
      honorific: form.honorific,
      male_name: form.male_name,
      slug: form.slug,
      custom_question: form.custom_question || null,
      is_active: form.is_active,
    };

    const res = await fetch(editingId ? `/api/date/invites/${editingId}` : '/api/date/invites', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Kayıt başarısız');
      return;
    }
    setMessage(editingId ? 'Güncellendi' : 'Oluşturuldu');
    setEditingId(null);
    setSlugTouched(false);
    setForm(emptyForm());
    await refresh();
  };

  const startEdit = (invite: InviteWithResponse) => {
    setEditingId(invite.id);
    setSlugTouched(true);
    setForm({
      name: invite.name,
      honorific: invite.honorific,
      male_name: invite.male_name,
      slug: invite.slug,
      custom_question: invite.custom_question || '',
      is_active: invite.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (invite: InviteWithResponse) => {
    await fetch(`/api/date/invites/${invite.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !invite.is_active }),
    });
    await refresh();
  };

  const copyUrl = async (slug: string) => {
    const url = `${siteUrl || window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(url);
    setMessage('URL kopyalandı');
  };

  const runConfirm = async () => {
    if (!confirm) return;
    if (confirm.type === 'delete') {
      await fetch(`/api/date/invites/${confirm.id}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/date/invites/${confirm.id}/reset`, { method: 'POST' });
    }
    setConfirm(null);
    await refresh();
  };

  const testTelegram = async () => {
    const res = await fetch('/api/date/telegram-test', { method: 'POST' });
    const data = await res.json();
    setMessage(res.ok ? 'Test bildirimi gönderildi' : data.error || 'Telegram hatası');
  };

  if (authed === null) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#111] text-white">
        Yükleniyor…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0f0f10] px-4">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl backdrop-blur"
        >
          <h1 className="mb-1 font-serif text-2xl">Date Admin</h1>
          <p className="mb-6 text-sm text-white/60">Şifre ile giriş yapın</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin şifresi"
            className="mb-3 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 outline-none focus:border-rose-400"
            autoFocus
          />
          {loginError ? <p className="mb-3 text-sm text-rose-300">{loginError}</p> : null}
          <button
            type="submit"
            className="w-full rounded-full bg-rose-600 px-4 py-3 font-medium hover:bg-rose-500"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0b0b0c] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl">Date Admin</h1>
            <p className="text-sm text-white/55">Kişiye özel date teklifleri</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
            >
              Verileri Yenile
            </button>
            <button
              type="button"
              onClick={() => void testTelegram()}
              className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
            >
              Test Telegram Bildirimi Gönder
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Çıkış
            </button>
          </div>
        </div>

        {message ? (
          <p className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
            {message}
          </p>
        ) : null}

        <form
          onSubmit={submitForm}
          className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
        >
          <h2 className="mb-4 text-lg font-medium">
            {editingId ? 'Daveti Düzenle' : 'Yeni Date Teklifi'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-white/60">Kadının adı</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-white/60">Hitap şekli</span>
              <input
                required
                value={form.honorific}
                onChange={(e) => setForm({ ...form, honorific: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-white/60">URL uzantısı</span>
              <input
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: e.target.value.toLowerCase() });
                }}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-white/60">Soruda erkek adı</span>
              <input
                required
                value={form.male_name}
                onChange={(e) => setForm({ ...form, male_name: e.target.value })}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-white/60">Özel soru (opsiyonel)</span>
              <textarea
                value={form.custom_question}
                onChange={(e) => setForm({ ...form, custom_question: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"
                placeholder="Boş bırakılırsa otomatik üretilir"
              />
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Aktif
            </label>
          </div>
          <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/70">
            Önizleme: {previewQuestion}
          </p>
          <p className="mt-2 text-xs text-white/45">
            URL: {(siteUrl || 'https://ataduman.com.tr') + '/' + (form.slug || '…')}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium hover:bg-rose-500"
            >
              {editingId ? 'Kaydet' : 'Oluştur'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setSlugTouched(false);
                  setForm(emptyForm());
                }}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm"
              >
                İptal
              </button>
            ) : null}
          </div>
        </form>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">Kayıtlar {loading ? '(yenileniyor…)' : ''}</h2>
          {invites.length === 0 ? (
            <p className="text-sm text-white/50">Henüz kayıt yok.</p>
          ) : (
            invites.map((invite) => {
              const url = `${siteUrl || ''}/${invite.slug}`;
              const responded = Boolean(invite.response);
              return (
                <article
                  key={invite.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-medium">
                        {invite.name} {invite.honorific}
                      </h3>
                      <a
                        href={`/${invite.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-rose-300 hover:underline"
                      >
                        /{invite.slug}
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full px-2.5 py-1 ${
                          invite.is_active ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {invite.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 ${
                          responded ? 'bg-rose-500/20 text-rose-200' : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {responded ? 'EVET 💖' : 'Cevap yok'}
                      </span>
                    </div>
                  </div>

                  <dl className="grid gap-2 text-sm text-white/70 sm:grid-cols-2">
                    <div>
                      <dt className="text-white/40">Oluşturulma</dt>
                      <dd>{formatTurkishDateTime(invite.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Görüntülenme</dt>
                      <dd>
                        {invite.view_count}
                        {invite.last_viewed_at
                          ? ` · son: ${formatTurkishDateTime(invite.last_viewed_at)}`
                          : ''}
                      </dd>
                    </div>
                    {invite.response ? (
                      <>
                        <div>
                          <dt className="text-white/40">Seçilen date</dt>
                          <dd>{formatTurkishDate(invite.response.selected_date, true)}</dd>
                        </div>
                        <div>
                          <dt className="text-white/40">Cevap zamanı</dt>
                          <dd>{formatTurkishDateTime(invite.response.responded_at)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-white/40">Tarayıcı</dt>
                          <dd className="break-all text-xs">{invite.response.user_agent || '—'}</dd>
                        </div>
                      </>
                    ) : null}
                    <div className="sm:col-span-2">
                      <dt className="text-white/40">Soru</dt>
                      <dd>
                        {buildQuestion(
                          invite.name,
                          invite.honorific,
                          invite.male_name,
                          invite.custom_question
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-white/40">Tam URL</dt>
                      <dd className="break-all text-xs">{url || `/${invite.slug}`}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`/${invite.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
                    >
                      Sayfayı aç
                    </a>
                    <button
                      type="button"
                      onClick={() => void copyUrl(invite.slug)}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
                    >
                      URL&apos;yi kopyala
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(invite)}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleActive(invite)}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
                    >
                      {invite.is_active ? 'Pasif yap' : 'Aktif yap'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({
                          type: 'reset',
                          id: invite.id,
                          title: 'Cevabı sıfırla?',
                          body: 'Bu davete verilen EVET cevabı ve tarih silinecek.',
                        })
                      }
                      className="rounded-full border border-amber-400/30 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-400/10"
                    >
                      Cevabı sıfırla
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({
                          type: 'delete',
                          id: invite.id,
                          title: 'Kaydı sil?',
                          body: 'Davet ve ilişkili cevap kalıcı olarak silinecek.',
                        })
                      }
                      className="rounded-full border border-rose-400/30 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-400/10"
                    >
                      Sil
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.title || ''}
        body={confirm?.body || ''}
        confirmLabel={confirm?.type === 'delete' ? 'Sil' : 'Sıfırla'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void runConfirm()}
      />
    </div>
  );
}

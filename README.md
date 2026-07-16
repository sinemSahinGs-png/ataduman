# ATA DUMAN — Portfolyo + Date Davet Sistemi

Next.js App Router üzerinde çalışan kişisel portfolyo sitesi ve kişiye özel romantik date teklif sistemi.

## Özellikler

- Ana sayfa: mevcut ATA DUMAN portfolyosu (`/legacy` build + iframe)
- Admin: `/date/admin`
- Kişiye özel sayfalar: `/{slug}` örn. `/gokcedate`

## 1) Kurulum

```bash
npm install
cp .env.example .env.local
```

`.env.local` içini doldurun:

```env
NEXT_PUBLIC_SITE_URL=https://ataduman.com.tr
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
DATE_ADMIN_PASSWORD=guclu-bir-sifre
DATE_ADMIN_SESSION_SECRET=en-az-16-karakter-gizli-anahtar
```

## 2) Supabase

1. Yeni bir Supabase projesi oluşturun (veya mevcut olanı kullanın).
2. SQL Editor’de `supabase/migrations/001_date_system.sql` dosyasını çalıştırın.
3. Project Settings → API:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (yalnızca sunucuda)

RLS açıktır; tarayıcıdan tabloya doğrudan yazma yoktur. Tüm işlemler Next.js API route’ları üzerinden service role ile yapılır.

## 3) Telegram Bot

1. [@BotFather](https://t.me/BotFather) ile bot oluşturun → `TELEGRAM_BOT_TOKEN`
2. Bot’a bir mesaj gönderin.
3. `https://api.telegram.org/bot<TOKEN>/getUpdates` ile `chat.id` alın → `TELEGRAM_CHAT_ID`
4. Admin panelinden **Test Telegram Bildirimi Gönder** ile doğrulayın.

## 4) Yerel çalıştırma

```bash
npm run dev
```

- Portfolyo: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/date/admin](http://localhost:3000/date/admin)

> Not: Ana sayfa `/legacy/index.html` dosyasını iframe ile yükler. İlk kez veya portfolyo değişince:

```bash
npm run build:portfolio
```

`npm run dev` sırasında legacy klasörü yoksa bir kez `npm run build:portfolio` çalıştırın.

## 5) Production build

```bash
npm run build
npm start
```

`build` önce Vite ile portfolyoyu `public/legacy` altına üretir, sonra Next.js build alır.

## 6) Vercel

1. GitHub reposunu Vercel’e bağlayın.
2. Environment Variables olarak `.env.example` alanlarını ekleyin.
3. Build Command: `npm run build` (varsayılan)
4. Deploy.

### Admin paneli kullanımı

1. `/date/admin` → `DATE_ADMIN_PASSWORD` ile giriş
2. Kadın adı, hitap, erkek adı, slug girin
3. Oluşan link: `https://ataduman.com.tr/{slug}`
4. EVET + tarih seçilince Telegram’a bildirim gider; admin listesinde cevap detayları görünür

## Güvenlik notları

- Admin şifresi ve Telegram / Supabase secret’ları yalnızca server-side kullanılır
- Admin oturumu HttpOnly cookie + HMAC imza
- Cevap sonrası HttpOnly cookie + localStorage + DB unique(invite_id)
- Geçersiz slug → 404
- Rate limit API route’larında aktiftir

## Klasörler

- `app/` — Next.js route’ları
- `src/components/date` — date sayfası UI
- `src/components/admin` — admin UI
- `src/lib/date` — supabase, auth, telegram, validation
- `_legacy_vite/` — orijinal portfolyo (Vite)
- `supabase/migrations/` — SQL

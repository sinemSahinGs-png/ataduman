const STORAGE_KEY = 'portfolio_locale';

const dict = {
  docTitle: {
    tr: 'ATA DUMAN — Özel Web Sitesi Tasarımı',
    en: 'ATA DUMAN — Custom Website Design',
  },
  docDesc: {
    tr: 'Ata Duman — özel web sitesi tasarımı, web geliştirme, Instagram otomasyonu, içerik tasarımı ve promosyon ürün tasarımı.',
    en: 'Ata Duman — custom website design, web development, Instagram automation, content design, and promotional product design.',
  },
  navAria: { tr: 'Ana menü', en: 'Main menu' },
  navHome: { tr: 'Anasayfa', en: 'Home' },
  menuAria: { tr: 'Site indeksi', en: 'Site index' },
  menuAbout: { tr: 'Hakkında', en: 'About' },
  menuWorks: { tr: 'Geliştirilen Sistemler', en: 'Built Systems' },
  menuPortfolio: { tr: 'Portfolyo', en: 'Portfolio' },
  menuCapabilities: { tr: 'Yetenekler', en: 'Capabilities' },
  menuProcess: { tr: 'Süreç', en: 'Process' },
  menuContact: { tr: 'İletişim', en: 'Contact' },
  heroAria: { tr: 'Portre görünümü', en: 'Portrait view' },
  heroMeta: { tr: 'Portfolyo / 2026', en: 'Portfolio / 2026' },
  heroTitle: { tr: 'WEB<br />SİSTEMLERİ', en: 'WEB<br />SYSTEMS' },
  heroTag: {
    tr: 'Strateji, arayüz ve kodla kurulan<br />markaya özel dijital deneyimler.',
    en: 'Brand-specific digital experiences<br />built with strategy, interface, and code.',
  },
  heroDesc: {
    tr: 'Web tasarımı / Geliştirme / Otomasyon',
    en: 'Web design / Development / Automation',
  },
  marqueeCustom: { tr: 'Özel Web Sitesi Tasarımı', en: 'Custom Website Design' },
  marqueeDev: { tr: 'Web Geliştirme', en: 'Web Development' },
  marqueeIg: { tr: 'Instagram Otomasyonu', en: 'Instagram Automation' },
  marqueeContent: { tr: 'İçerik Tasarımı', en: 'Content Design' },
  marqueePromo: { tr: 'Promosyon Ürün Tasarımı', en: 'Promotional Product Design' },
  stripHome: { tr: 'Anasayfa 2025 / 2026', en: 'Home 2025 / 2026' },
  stripIssue: { tr: 'Sayı 001', en: 'Issue 001' },
  stripRotate: { tr: 'Rotasyonda', en: 'In rotation' },
  aboutMeta: { tr: '01 — Hakkında / Manifesto', en: '01 — About / Manifesto' },
  aboutW1: { tr: 'MARKANIZA', en: 'FOR YOUR' },
  aboutW2: { tr: 'ÖZEL', en: 'OWN' },
  aboutW3: { tr: 'WEB', en: 'WEB' },
  aboutW4: { tr: 'SİTELERİ', en: 'SITES' },
  aboutSvc1: { tr: 'KURUMSAL WEB', en: 'CORPORATE WEB' },
  aboutSvc2: { tr: 'GELİŞTİRME', en: 'DEVELOPMENT' },
  aboutSvc3: { tr: 'OTOMASYON', en: 'AUTOMATION' },
  aboutSvc4: { tr: 'İÇERİK', en: 'CONTENT' },
  aboutSvc5: { tr: 'PROMOSYON', en: 'PROMO' },
  aboutP1: {
    tr: ' Duman; kurumsal web tasarımı, web geliştirme ve dijital otomasyon alanlarında çalışan bağımsız bir tasarımcı ve geliştiricidir.',
    en: ' Duman is an independent designer and developer working across corporate web design, web development, and digital automation.',
  },
  aboutP2: {
    tr: 'Her proje; markanın hedeflerine, içerik yapısına ve kullanıcı ihtiyaçlarına göre sıfırdan planlanır. Sonuç; hızlı, mobil uyumlu, yönetilebilir ve markaya özel bir web sitesidir.',
    en: 'Every project is planned from scratch around brand goals, content structure, and user needs. The result is a fast, mobile-ready, manageable website built for the brand.',
  },
  aboutP3: {
    tr: 'Instagram otomasyonu, içerik tasarımı ve promosyon ürünleri; web projelerini destekleyen tamamlayıcı hizmetlerdir.',
    en: 'Instagram automation, content design, and promotional products are complementary services that support web projects.',
  },
  metaClass: { tr: 'Sınıf', en: 'Class' },
  metaClassVal: { tr: 'Web Tasarımı & Geliştirme', en: 'Web Design & Development' },
  metaApproach: { tr: 'Yaklaşım', en: 'Approach' },
  metaApproachVal: { tr: 'Markaya Özel · Sıfırdan', en: 'Brand-specific · From scratch' },
  metaFocus: { tr: 'Odak', en: 'Focus' },
  metaFocusVal: { tr: 'Kurumsal Web · Otomasyon', en: 'Corporate Web · Automation' },
  metaStatus: { tr: 'Durum', en: 'Status' },
  metaStatusVal: { tr: 'Çevrimiçi', en: 'Online' },
  worksMeta: { tr: '02 — Geliştirilen Sistemler', en: '02 — Built Systems' },
  worksTitle: { tr: 'Geliştirilen Sistemler', en: 'Built Systems' },
  work1Alt: { tr: 'Web tasarımı projesi', en: 'Web design project' },
  work1Meta: { tr: '(01 / 03) · Tasarım · 2025', en: '(01 / 03) · Design · 2025' },
  work1Title: { tr: 'Özel Web Sitesi Tasarımı', en: 'Custom Website Design' },
  work1Body: {
    tr: 'Netlik, hiyerarşi ve hareket etrafında kurulan premium web siteleri — şablon gibi değil, düşünülmüş hissi veren işler.',
    en: 'Premium websites built around clarity, hierarchy, and motion — work that feels considered, never templated.',
  },
  work1Tag1: { tr: 'Tasarım', en: 'Design' },
  work1Tag2: { tr: 'Sanat yönetimi', en: 'Art direction' },
  workCta: { tr: 'Projeyi gör →', en: 'View project →' },
  work2Alt: { tr: 'Web geliştirme projesi', en: 'Web development project' },
  work2Meta: { tr: '(02 / 03) · Geliştirme · 2025', en: '(02 / 03) · Development · 2025' },
  work2Title: { tr: 'Uygulama Geliştirme', en: 'Application Development' },
  work2Body: {
    tr: 'Tasarımı koruyan front-end üretimi — performans, etkileşim ve üretimde temiz kalan sistemler.',
    en: 'Front-end production that protects the design — performance, interaction, and systems that stay clean in production.',
  },
  work2Tag2: { tr: 'Hareket', en: 'Motion' },
  work2Tag3: { tr: 'Sistemler', en: 'Systems' },
  work3Alt: { tr: 'Otomasyon projesi', en: 'Automation project' },
  work3Meta: { tr: '(03 / 03) · Otomasyon · 2026', en: '(03 / 03) · Automation · 2026' },
  work3Title: { tr: 'Instagram Otomasyonu', en: 'Instagram Automation' },
  work3Body: {
    tr: 'İçerik ritmi için sakin işletim sistemleri — günlük sürtünme olmadan tutarlı varlık sağlayan akışlar.',
    en: 'Quiet operating systems for content rhythm — flows that keep a consistent presence without daily friction.',
  },
  work3Tag1: { tr: 'Otomasyon', en: 'Automation' },
  work3Tag2: { tr: 'İş akışı', en: 'Workflow' },
  work3Tag3: { tr: 'Sosyal', en: 'Social' },
  portfolioMeta: { tr: '03 — Portfolyo', en: '03 — Portfolio' },
  portfolioTitle: { tr: 'Portfolyo', en: 'Portfolio' },
  capsMeta: { tr: '04 — Yetenekler', en: '04 — Capabilities' },
  capsTitle: { tr: 'Yetenekler', en: 'Capabilities' },
  cap1Title: { tr: 'Özel Web Sitesi Tasarımı', en: 'Custom Website Design' },
  cap1Body: {
    tr: 'Varlık sahibi bir site isteyen markalar için sanat yönetimi, yerleşim sistemleri ve arayüz tasarımı.',
    en: 'Art direction, layout systems, and interface design for brands that want a site with presence.',
  },
  cap1Tags: { tr: 'Tasarım · UI · Yönlendirme', en: 'Design · UI · Direction' },
  cap2Title: { tr: 'Web Geliştirme', en: 'Web Development' },
  cap2Body: {
    tr: 'Hareket, yapı ve performansın zanaatın parçası sayıldığı front-end uygulaması.',
    en: 'Front-end implementation where motion, structure, and performance are part of the craft.',
  },
  cap2Tags: { tr: 'Kod · Hareket · Üretim', en: 'Code · Motion · Production' },
  cap3Title: { tr: 'Instagram Otomasyonu', en: 'Instagram Automation' },
  cap3Body: {
    tr: 'Marka ritmine göre kurgulanmış zamanlama, akışlar ve içerik operasyonu — jenerik araçlar değil.',
    en: 'Scheduling, flows, and content operations shaped to brand rhythm — not generic tools.',
  },
  cap3Tags: { tr: 'Sosyal · Sistem · Ritim', en: 'Social · System · Rhythm' },
  cap4Title: { tr: 'İçerik & Ürünler', en: 'Content & Products' },
  cap4Body: {
    tr: 'Dijital sistemle hizalı kalan içerik tasarımı ve promosyon ürün çalışmaları.',
    en: 'Content design and promotional product work that stays aligned with the digital system.',
  },
  cap4Tags: { tr: 'İçerik · Baskı · Promo', en: 'Content · Print · Promo' },
  processMeta: { tr: '05 — Süreç', en: '05 — Process' },
  processTitle: { tr: 'Süreç', en: 'Process' },
  process1Label: { tr: 'Brief', en: 'Brief' },
  process1Body: {
    tr: 'Tek cümleye indirgenmiş bir brief. Moodboard’dan çok kısıtlar tercih edilir.',
    en: 'A brief reduced to one sentence. Constraints preferred over moodboards.',
  },
  process2Label: { tr: 'Konsept', en: 'Concept' },
  process2Body: {
    tr: 'Yapı, tipografi ve etkileşim; site açıklama gerektirmeden konuşana kadar düzenlenir.',
    en: 'Structure, typography, and interaction are refined until the site speaks without explanation.',
  },
  process3Label: { tr: 'İnce ayar', en: 'Fine-tuning' },
  process3Body: {
    tr: 'Boşluk, hareket ve hiyerarşi; hiçbir şey rastgele hissedilene kadar ayarlanır.',
    en: 'Spacing, motion, and hierarchy are adjusted until nothing feels accidental.',
  },
  process4Label: { tr: 'Deneyim', en: 'Experience' },
  process4Body: {
    tr: 'Tam bir teslimat — tasarım, geliştirme ve ayakta duran sistemler.',
    en: 'A complete delivery — design, development, and systems that stand on their own.',
  },
  ctaMeta: { tr: '06 — Proje / İletişim', en: '06 — Project / Contact' },
  ctaAria: {
    tr: 'Yeni siten burada başlasın.',
    en: 'Let your new site start here.',
  },
  ctaW1: { tr: 'YENİ', en: 'YOUR' },
  ctaW2: { tr: 'SİTEN', en: 'NEW SITE' },
  ctaW3: { tr: 'burada', en: 'starts' },
  ctaW4: { tr: 'BAŞLASIN.', en: 'HERE.' },
  ctaBody: {
    tr: 'Kurumsal web sitesi, otomasyon veya dijital içerik projenizin detaylarını paylaşın. Bir iş günü içinde geri dönüş sağlanır.',
    en: 'Share the details of your corporate website, automation, or digital content project. You will hear back within one business day.',
  },
  ctaButton: { tr: 'PROJEYİ BAŞLAT', en: 'START A PROJECT' },
  ctaAvail: { tr: 'Dünya çapında uygun', en: 'Available worldwide' },
  footerTag: {
    tr: 'Tasarım sistemleri / İnşa edilen deneyimler',
    en: 'Design systems / Built experiences',
  },
};

function readLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'tr') return stored;
  } catch {
    /* ignore */
  }
  return 'tr';
}

function writeLocale(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

function applyLocale(locale) {
  const lang = locale === 'en' ? 'en' : 'tr';
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const entry = dict[key];
    if (!entry) return;
    const value = entry[lang] ?? entry.tr;
    if (el.hasAttribute('data-i18n-html')) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const raw = el.getAttribute('data-i18n-attr');
    if (!raw) return;
    raw.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const entry = dict[key];
      if (!attr || !entry) return;
      el.setAttribute(attr, entry[lang] ?? entry.tr);
    });
  });

  const title = dict.docTitle[lang];
  const desc = dict.docDesc[lang];
  document.title = title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', desc);

  document.querySelectorAll('[data-lang]').forEach((btn) => {
    const active = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function localeFromQuery() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en' || q === 'tr') return q;
  } catch {
    /* ignore */
  }
  return null;
}

function navigateToLocale(locale) {
  const target = locale === 'en' ? '/eng' : '/';
  try {
    if (window.parent && window.parent !== window) {
      window.parent.location.assign(target);
      return;
    }
  } catch {
    /* fall through */
  }
  window.location.assign(target);
}

export function initPortfolioI18n() {
  const fromQuery = localeFromQuery();
  const locale = fromQuery || readLocale();
  if (fromQuery) writeLocale(fromQuery);
  applyLocale(locale);

  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-lang');
      if (next !== 'tr' && next !== 'en') return;
      if (next === locale) return;
      writeLocale(next);
      navigateToLocale(next);
    });
  });
}

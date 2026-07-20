export type DateLocale = 'tr' | 'en';

export const DATE_LOCALE_KEY = 'date_invite_locale';

type Dictionary = {
  eyebrow: string;
  defaultHint: string;
  inactive: string;
  yes: string;
  errorFallback: string;
  errorNetwork: string;
  pickerEyebrow: string;
  pickerTitle: string;
  pickerSubtitle: string;
  pickerLabel: string;
  pickerSelected: string;
  pickerEmpty: string;
  pickerConfirm: string;
  pickerConfirming: string;
  successEyebrow: string;
  successTitle: string;
  successBody: (name: string, honorific: string, maleName: string) => string;
  successDateLabel: string;
  successFooter: string;
  noLabels: string[];
  noHints: string[];
  apiErrors: Record<string, string>;
};

export const dictionaries: Record<DateLocale, Dictionary> = {
  tr: {
    eyebrow: 'Size özel bir soru var',
    defaultHint: 'Bir jest yeter — doğru olanı seçin.',
    inactive: 'Bu davet şu an aktif değil.',
    yes: 'EVET',
    errorFallback: 'Bir hata oluştu',
    errorNetwork: 'Bağlantı hatası. Lütfen tekrar deneyin.',
    pickerEyebrow: 'Bir sonraki adım',
    pickerTitle: 'Harika bir karar.',
    pickerSubtitle: 'Size uygun bir gün seçin.',
    pickerLabel: 'Date tarihi',
    pickerSelected: 'Seçilen',
    pickerEmpty: 'Takvimden bir tarih seçin',
    pickerConfirm: 'Date’i onayla',
    pickerConfirming: 'Onaylanıyor…',
    successEyebrow: 'Onaylandı',
    successTitle: 'Date onaylandı.',
    successBody: (name, honorific, maleName) =>
      `${name} ${honorific} ve ${maleName} için zarif bir gün seçildi.`,
    successDateLabel: 'Seçilen tarih',
    successFooter: 'Ata Duman bu cevabı unutmayacak.',
    noLabels: [
      'Hayır',
      'Emin misiniz?',
      'Tekrar düşünün',
      'Yanlış seçenek',
      'O buton bugün yoğun',
      'EVET daha mantıklı',
      'Bir daha deneyin',
      'Buna basmak zor 🙂',
      'Sanırım diğer buton daha iyi',
    ],
    noHints: [
      'Güzel cevaplar genelde acele etmez.',
      'Bu seçenek biraz çekingen — diğerini deneyin.',
      'Kalbiniz muhtemelen doğru yeri biliyor.',
      'Nazik bir teklif, net bir jest ister.',
      'Kaçan butonlar, doğru kararları hatırlatır.',
      'Belki de EVET daha zarif duruyor.',
    ],
    apiErrors: {},
  },
  en: {
    eyebrow: 'A question just for you',
    defaultHint: 'One gesture is enough — choose wisely.',
    inactive: 'This invitation is not active right now.',
    yes: 'YES',
    errorFallback: 'Something went wrong',
    errorNetwork: 'Connection error. Please try again.',
    pickerEyebrow: 'Next step',
    pickerTitle: 'Wonderful choice.',
    pickerSubtitle: 'Pick a day that works for you.',
    pickerLabel: 'Date',
    pickerSelected: 'Selected',
    pickerEmpty: 'Choose a date from the calendar',
    pickerConfirm: 'Confirm the date',
    pickerConfirming: 'Confirming…',
    successEyebrow: 'Confirmed',
    successTitle: 'Date confirmed.',
    successBody: (name, honorific, maleName) =>
      `An elegant day has been chosen for ${name} ${honorific} and ${maleName}.`,
    successDateLabel: 'Selected date',
    successFooter: 'Ata Duman will not forget this answer.',
    noLabels: [
      'No',
      'Are you sure?',
      'Think again',
      'Wrong option',
      'That button is busy today',
      'YES makes more sense',
      'Try once more',
      'Hard to press 🙂',
      'The other button looks better',
    ],
    noHints: [
      'Good answers rarely rush.',
      'This option is a little shy — try the other.',
      'Your heart probably already knows.',
      'A gentle offer asks for a clear gesture.',
      'Buttons that run away remind you of the right choice.',
      'Maybe YES looks more graceful.',
    ],
    apiErrors: {
      'Çok fazla istek. Lütfen bekleyin.': 'Too many requests. Please wait.',
      'Geçersiz istek': 'Invalid request',
      'Doğrulama hatası': 'Validation error',
      'Geçersiz tarih': 'Invalid date',
      'Geçmiş bir tarih seçilemez': 'Past dates cannot be selected',
      'Davet bulunamadı veya aktif değil': 'Invitation not found or inactive',
      'Bu davet için zaten cevap verdiniz': 'You already answered this invitation',
      'Cevap kaydedilemedi. Lütfen tekrar deneyin.':
        'Could not save your answer. Please try again.',
    },
  },
};

export function buildLocalizedQuestion(
  locale: DateLocale,
  name: string,
  honorific: string,
  maleName: string,
  customQuestion?: string | null
): string {
  if (customQuestion?.trim()) return customQuestion.trim();
  if (locale === 'en') {
    return `${name} ${honorific}, would you like to go on a date with ${maleName}?`;
  }
  return `${name} ${honorific}, ${maleName}'la date'e çıkmak ister misiniz?`;
}

export function formatInviteDate(
  dateInput: string | Date,
  locale: DateLocale,
  withWeekday = false
): string {
  const date =
    typeof dateInput === 'string' ? new Date(`${dateInput}T12:00:00`) : dateInput;
  const options: Intl.DateTimeFormatOptions = withWeekday
    ? { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }
    : { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'tr-TR', options).format(
    date
  );
}

export function localizeApiError(message: string, locale: DateLocale): string {
  if (locale === 'tr') return message;
  return dictionaries.en.apiErrors[message] || message;
}

export function readStoredLocale(): DateLocale {
  if (typeof window === 'undefined') return 'tr';
  try {
    const stored = localStorage.getItem(DATE_LOCALE_KEY);
    if (stored === 'en' || stored === 'tr') return stored;
  } catch {
    /* ignore */
  }
  return 'tr';
}

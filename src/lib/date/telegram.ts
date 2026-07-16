export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[telegram] send failed', res.status, body);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[telegram] send error', error);
    return false;
  }
}

export function buildAcceptanceTelegramMessage(params: {
  displayName: string;
  selectedDateLabel: string;
  respondedAtLabel: string;
}): string {
  return [
    `💖 ${params.displayName} date teklifini kabul etti!`,
    '',
    `📅 Seçilen tarih: ${params.selectedDateLabel}`,
    `🕒 Cevap zamanı: ${params.respondedAtLabel}`,
  ].join('\n');
}

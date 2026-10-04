/**
 * MarketSense Telegram Integration Library
 * 
 * Provides robust, non-blocking notification dispatching to Telegram channels,
 * personal groups, or direct messages. Handles both server proxy and direct client fallbacks.
 */

import { MovementCause, DailyMacroImpact, CriticalEvent } from '../data/marketSignals';
import { LiveQuote } from '../types/market';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  displayName: string;
}

export interface BuildBriefingParams {
  trackedTickers: string[];
  causesMap: Record<string, MovementCause>;
  customPrices: Record<string, string>;
  macroImpacts: DailyMacroImpact[];
  nextEvent?: CriticalEvent;
  clockTime: string;
  clockMode: 'local' | 'ny' | 'dublin';
  userCity: string;
}

/**
 * Formats a clean, high-signal executive briefing text for Telegram.
 */
export function buildDailyBriefing({
  trackedTickers,
  causesMap,
  customPrices,
  macroImpacts,
  nextEvent,
  clockTime,
  clockMode,
  userCity
}: BuildBriefingParams): string {
  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const tzLabel = clockMode === 'local' ? `Local ${userCity}` : clockMode === 'ny' ? 'Wall St (NY)' : 'Dublín';
  
  let text = `🏛️ MARKETSENSE · INFORME FUNDAMENTAL\n`;
  text += `📅 ${dateStr} · 🕒 ${clockTime} (${tzLabel})\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  text += `🎯 PREVISIONES & CAUSA REAL DE TUS ACTIVOS:\n\n`;
  trackedTickers.forEach(ticker => {
    const cause = causesMap[ticker];
    if (!cause) return;
    const activePrice = customPrices[ticker] || cause.price;
    text += `▫️ ${ticker} (${activePrice} · ${cause.change}):\n`;
    text += `  • Previsión: Corto: ${cause.shortTermOutlook.arrow} ${cause.shortTermOutlook.label} | Medio: ${cause.midTermOutlook.arrow} ${cause.midTermOutlook.label} | Largo: ${cause.longTermOutlook.arrow} ${cause.longTermOutlook.label}\n`;
    text += `  • Causa: ${cause.rootCause}\n`;
    text += `  • Filtro de Ruido: ${cause.noiseExplanation}\n`;
    text += `  • Veredicto: ${cause.verdict}\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚡ LO MÁS RELEVANTE EXPLICADO SIN RUIDO:\n\n`;
  macroImpacts.slice(0, 2).forEach(item => {
    text += `📌 ${item.title}\n`;
    text += `  • Impacto Real: ${item.plainLanguage}\n`;
    text += `  • Afecta a: ${item.affectsTickers.join(', ')}\n\n`;
  });

  if (nextEvent) {
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🔔 PRÓXIMO HITO DECISIVO:\n`;
    text += `• ${nextEvent.date} (${nextEvent.tickerOrSector}): ${nextEvent.event} (Impacto: ${nextEvent.balanceImpact})\n`;
  }

  return text;
}

/**
 * Builds a single, comprehensive Telegram message for an individual asset.
 */
export function buildAssetTelegramMessage(
  ticker: string,
  cause: MovementCause,
  activePrice: string
): string {
  const trafficEmoji = cause.trafficLight === 'VERDE' ? '🟢' : cause.trafficLight === 'AMBAR' ? '🟡' : '🔴';
  const trafficText = cause.trafficLight === 'VERDE' 
    ? 'Balance Sólido / Protegido' 
    : cause.trafficLight === 'AMBAR' 
      ? 'Atención / Ruido Mediático' 
      : 'Alerta Contable / Revisar Deuda';

  let msg = `🏛️ MARKETSENSE · INFORME INDIVIDUAL\n`;
  msg += `📌 Activo: ${cause.name} (${ticker})\n`;
  msg += `💵 Precio Actual: ${activePrice} (${cause.change})\n`;
  msg += `🚦 Semáforo de Riesgo: ${trafficEmoji} ${trafficText}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `📈 PREVISIÓN TÉCNICA Y CONTABLE:\n`;
  msg += `• Corto Plazo: ${cause.shortTermOutlook.arrow} ${cause.shortTermOutlook.label} (${cause.shortTermOutlook.summary})\n`;
  msg += `• Medio Plazo: ${cause.midTermOutlook.arrow} ${cause.midTermOutlook.label} (${cause.midTermOutlook.summary})\n`;
  msg += `• Largo Plazo: ${cause.longTermOutlook.arrow} ${cause.longTermOutlook.label} (${cause.longTermOutlook.summary})\n\n`;

  msg += `💡 ¿POR QUÉ SE MUEVE HOY?:\n${cause.rootCause}\n\n`;
  msg += `🛡️ FILTRO DE RUIDO:\n${cause.noiseExplanation}\n\n`;
  msg += `📊 SALUD CONTABLE TANGIBLE:\n`;
  msg += `• EBITDA: ${cause.ebitdaImpact}\n`;
  msg += `• Deuda & Solvencia: ${cause.debtSolvencyImpact}\n`;
  msg += `• Flujo de Caja (FCF): ${cause.cashFlowImpact}\n\n`;
  msg += `⚖️ VEREDICTO EJECUTIVO:\n${cause.verdict}\n`;

  return msg;
}

/**
 * Sends a message via Telegram bot with automated server proxy and direct fallback.
 */
export async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string
): Promise<{ success: boolean; message: string }> {
  if (!token.trim() || !chatId.trim()) {
    return {
      success: false,
      message: 'Faltan credenciales de Telegram (Bot Token o Chat ID).'
    };
  }

  try {
    // 1. First attempt via backend proxy
    let res = await fetch('/api/telegram-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim(), chatId: chatId.trim(), text }),
    }).catch(() => null);

    if (res && res.ok) {
      return { success: true, message: 'Mensaje despachado a Telegram con éxito.' };
    }

    // 2. Direct fallback
    const directRes = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await directRes.json();
    if (data.ok) {
      return { success: true, message: 'Mensaje despachado a Telegram con éxito.' };
    } else {
      return { success: false, message: `Error de Telegram: ${data.description || 'Desconocido'}` };
    }
  } catch (error: any) {
    return { success: false, message: `Fallo de red: ${error.message}` };
  }
}

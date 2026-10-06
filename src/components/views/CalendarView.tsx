/**
 * CalendarView Component
 * 
 * Shows upcoming critical dates that materially shift balance sheets, interest rate decisions,
 * sovereign debt auctions, and central bank FOMC/ECB meetings.
 * Also monitors sentiment vs. accounting reality across 4 global trading centers.
 */

import React from 'react';
import { CRITICAL_EVENTS_CALENDAR, GLOBAL_MARKET_PULSE, CriticalEvent, GlobalMarketPulse } from '../../data/marketSignals';

interface CalendarViewProps {
  events?: CriticalEvent[];
  pulses?: GlobalMarketPulse[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events = CRITICAL_EVENTS_CALENDAR,
  pulses = GLOBAL_MARKET_PULSE,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Critical Events Calendar */}
      <div className="space-y-3">
        <div className="border-b border-[#E7E2D8] pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#191C21] tracking-tight">
              Eventos Decisivos de Mercado
            </h2>
            <p className="text-xs text-slate-500">
              Fechas clave que pueden generar volatilidad o cambios de tendencia.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Horario CET</span>
        </div>

        <div className="space-y-2.5">
          {events.map(ev => (
            <div key={ev.id} className="p-4 rounded-xl bg-white border border-[#E7E2D8] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-[#EFECE4] text-slate-800">
                    {ev.date}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{ev.timeDublin}</span>
                  <span className="text-xs font-bold text-emerald-800 font-mono">{ev.tickerOrSector}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    ev.urgency === 'Crítico' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {ev.urgency === 'Crítico' ? '⚡ Alta Volatilidad Intradía' : '🌊 Volatilidad Moderada'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#191C21]">{ev.event}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ev.whyMatters}</p>
              </div>

              <div className="md:text-right shrink-0 p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8] md:max-w-xs text-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Impacto Contable:</span>
                <span className="font-medium text-emerald-800">{ev.balanceImpact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Market Sentiment vs Fundamental Reality */}
      <div className="space-y-3 pt-4 border-t border-[#E7E2D8]">
        <div className="border-b border-[#E7E2D8] pb-2">
          <h3 className="text-base font-bold text-[#191C21] tracking-tight">
            Pulso de Mercados Globales
          </h3>
          <p className="text-xs text-slate-500">
            Sentimiento de mercado frente a la realidad contable de cada plaza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {pulses.map((pulse, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-[#E7E2D8] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-bold text-[#191C21] font-mono">{pulse.region}</strong>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  pulse.crowdSentiment.includes('Pánico') || pulse.crowdSentiment.includes('Miedo')
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Masa: {pulse.crowdSentiment}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {pulse.fundamentalReality}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

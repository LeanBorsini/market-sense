/**
 * MacroImpactView Component
 * 
 * Presents critical market news filtered through accounting facts.
 * Explains macroeconomic shifts in plain language ("En Cristiano")
 * and filters out media sensationalism by contrasting with official SEC/CNMV filings.
 */

import React from 'react';
import { RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';
import { DAILY_MACRO_IMPACT, DailyMacroImpact } from '../../data/marketSignals';

interface MacroImpactViewProps {
  isRefreshingNews: boolean;
  onRefreshNews: () => Promise<void>;
  newsLastSynced: string;
  newsSyncNotice: string | null;
  macroImpacts?: DailyMacroImpact[];
}

export const MacroImpactView: React.FC<MacroImpactViewProps> = ({
  isRefreshingNews,
  onRefreshNews,
  newsLastSynced,
  newsSyncNotice,
  macroImpacts = DAILY_MACRO_IMPACT,
}) => {
  const getTrafficLightBadge = (light: 'VERDE' | 'AMBAR' | 'ROJO') => {
    if (light === 'VERDE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>Saludable / Favorable</span>
        </span>
      );
    }
    if (light === 'AMBAR') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          <span>Atención / Ruido</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
        <span>Alerta de Balance</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header with News Live Control & Sync Status */}
      <div className="p-4 rounded-2xl bg-white border border-[#E7E2D8] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#191C21] tracking-tight">
                Impacto de Noticias
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>En Vivo</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hechos relevantes y noticias contrastadas con balances oficiales.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefreshNews}
            disabled={isRefreshingNews}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95 shrink-0 disabled:opacity-60"
            title="Comprobar si hay nuevos hechos relevantes o comunicados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingNews ? 'animate-spin' : ''}`} />
            <span>{isRefreshingNews ? 'Comprobando...' : 'Comprobar Novedades'}</span>
          </button>
        </div>

        {/* Sync Metadata & Schedule Info */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800">Última comprobación:</span>
            <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#DDD8CD] font-mono text-emerald-800 font-bold">
              {newsLastSynced}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px]">
            <span>⏰ 4 veces al día (09:00, 15:30, 20:00 y 22:00 CET)</span>
          </div>
        </div>

        {newsSyncNotice && (
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{newsSyncNotice}</span>
          </div>
        )}
      </div>

      {/* News Cards with Prominent Date & Source Auditing */}
      <div className="space-y-3.5">
        {macroImpacts.map(item => (
          <div key={item.id} className="p-5 rounded-2xl bg-white border border-[#E7E2D8] shadow-xs space-y-3.5">
            {/* Date, Time, Source & Validity Header Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F5F2EB] text-[11px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#DDD8CD] font-semibold text-slate-800 flex items-center gap-1">
                  <span>📅</span>
                  <span>{item.date}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-emerald-800 font-mono font-bold">{item.time}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-medium hidden sm:inline">
                  Campana: {item.sessionWindow}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>{item.statusBadge}</span>
                </span>
              </div>
            </div>

            {/* Category & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start sm:items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#EFECE4] text-slate-700 shrink-0 mt-0.5 sm:mt-0">
                  {item.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#191C21]">
                  {item.title}
                </h3>
              </div>

              <div className="shrink-0">
                {getTrafficLightBadge(item.trafficLight)}
              </div>
            </div>

            {/* Audited Source Verification */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#EDE8DE]">
              <span className="font-semibold text-slate-700">🏛️ Fuente:</span>
              <span className="text-slate-800">{item.source}</span>
            </div>

            {/* Impact for your money */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span>Impacto Real para tu Dinero:</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                {item.plainLanguage}
              </p>
            </div>

            {/* Contrast: What media screams vs What accounting says */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-1">
                <span className="text-slate-500 font-semibold block">Ruido mediático:</span>
                <p className="text-slate-700 leading-relaxed">{item.mediaNoise}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-1">
                <span className="text-emerald-800 font-semibold block">Realidad contable:</span>
                <p className="text-slate-700 leading-relaxed">{item.fundamentalReality}</p>
              </div>
            </div>

            {/* Affected tickers in your portfolio */}
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E7E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">Afecta a:</span>
                <div className="flex items-center gap-1.5">
                  {item.affectsTickers.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-emerald-700 text-white font-mono font-bold text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <span className="text-emerald-800 font-semibold">
                Veredicto: {item.actionableVerdict}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

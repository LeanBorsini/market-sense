/**
 * WatchlistView Component
 * 
 * Interactive vertical accordion displaying real-time tracked assets.
 * Integrates:
 * - Real vs Projected Market Prices
 * - 3-Horizon Technical & Accounting Outlook (Short, Mid, Long)
 * - Root Cause vs Media Noise Filter
 * - Tangible Balance Health Metrics (EBITDA, Net Debt, Free Cash Flow)
 * - Inline TradingView Chart Link
 * - Manual Price Override Drawer
 * - Direct Telegram Dispatch per asset
 * - Embedded AI Financial Consultant Chatbot
 */

import React from 'react';
import { 
  ChevronDown, 
  ArrowUpRight, 
  Send, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Copy, 
  Check,
  Activity 
} from 'lucide-react';
import { WHY_IT_MOVES_DATA, MovementCause, HorizonOutlook } from '../../data/marketSignals';
import { auditTickerFundamentals } from '../../data/marketSignals';
import { resolveTradingViewSymbol } from '../../lib/symbolResolver';
import { TickerAIConsultant } from '../TickerAIConsultant';
import { LiveQuote } from '../../types/market';

interface WatchlistViewProps {
  trackedTickers: string[];
  expandedTicker: string | null;
  toggleAccordion: (ticker: string) => void;
  getTickerLiveQuote: (ticker: string, fallbackPrice: string, fallbackChange?: string, fallbackPositive?: boolean) => LiveQuote;
  customPrices: Record<string, string>;
  editingPriceTicker: string | null;
  setEditingPriceTicker: (ticker: string | null) => void;
  editingPriceVal: string;
  setEditingPriceVal: (val: string) => void;
  handleSaveCustomPrice: (ticker: string) => void;
  openAIConsultantTicker: string | null;
  setOpenAIConsultantTicker: (ticker: string | null) => void;
  removeTickerFromWatchlist: (e: React.MouseEvent, ticker: string) => void;
  executiveReportText: string;
  copyText: (text: string) => void;
  isCopied: boolean;
  currentUser: any;
  onOpenChart?: (asset: {
    ticker: string;
    name: string;
    tradingViewSymbol: string;
    price: string;
    change: string;
    trafficLight?: 'VERDE' | 'AMBAR' | 'ROJO';
  }) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  trackedTickers,
  expandedTicker,
  toggleAccordion,
  getTickerLiveQuote,
  customPrices,
  editingPriceTicker,
  setEditingPriceTicker,
  editingPriceVal,
  setEditingPriceVal,
  handleSaveCustomPrice,
  openAIConsultantTicker,
  setOpenAIConsultantTicker,
  removeTickerFromWatchlist,
  executiveReportText,
  copyText,
  isCopied,
  currentUser,
  onOpenChart,
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

  const getOutlookBadge = (outlook: HorizonOutlook) => {
    const isUp = outlook.trend === 'AL_ALZA';
    const isStable = outlook.trend === 'ESTABLE';

    return (
      <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
        isUp 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
          : isStable 
            ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
            : 'bg-rose-50/70 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-center justify-between font-bold">
          <span className="text-[11px] text-slate-600 uppercase tracking-wide">{outlook.period}</span>
          <span className="flex items-center gap-1 text-xs">
            <strong className="text-sm font-mono">{outlook.arrow}</strong>
            <span>{outlook.label}</span>
          </span>
        </div>
        <p className="text-[11px] leading-tight text-slate-700">
          {outlook.summary}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header info */}
      <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base sm:text-lg font-bold text-[#191C21] tracking-tight">
            Tickers en Seguimiento
          </h2>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
            {trackedTickers.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copyText(executiveReportText)}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAF8F5] text-slate-700 text-xs font-medium border border-[#DDD8CD] transition flex items-center gap-1 shadow-xs cursor-pointer"
            title="Copiar informe completo"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopied ? '¡Copiado!' : 'Copiar Síntesis'}</span>
            <span className="sm:hidden">{isCopied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Vertical Accordion List */}
      <div className="space-y-2.5">
        {trackedTickers.map(ticker => {
          const cause = WHY_IT_MOVES_DATA[ticker] || auditTickerFundamentals(ticker);
          const isExpanded = expandedTicker === ticker;
          const liveQuote = getTickerLiveQuote(ticker, cause.price, cause.change, cause.isPositive);
          const activePrice = customPrices[ticker] || cause.price;

          return (
            <div 
              key={ticker} 
              className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isExpanded 
                  ? 'bg-white border-[#C9C4B8] ring-1 ring-emerald-600/10' 
                  : 'bg-white/80 border-[#E7E2D8] hover:bg-white hover:border-[#DDD8CD]'
              }`}
            >
              {/* Collapsed Header Row (Always Clickable) */}
              <div 
                onClick={() => toggleAccordion(ticker)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none gap-3"
              >
                {/* Left: Ticker & Name & Traffic light dot */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    cause.trafficLight === 'VERDE' 
                      ? 'bg-emerald-500 ring-4 ring-emerald-100' 
                      : cause.trafficLight === 'AMBAR' 
                        ? 'bg-amber-500 ring-4 ring-amber-100' 
                        : 'bg-rose-500 ring-4 ring-rose-100'
                  }`} />

                  <div className="min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                      <span className="font-bold text-base text-[#191C21] font-mono tracking-tight shrink-0">
                        {cause.ticker}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {cause.name}
                      </span>
                    </div>
                    
                    {/* Mini inline horizon pills */}
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-mono">
                      <span title={`Corto plazo: ${cause.shortTermOutlook.label}`}>
                        Corto: <strong className={cause.shortTermOutlook.trend === 'AL_ALZA' ? 'text-emerald-700' : 'text-slate-700'}>{cause.shortTermOutlook.arrow}</strong>
                      </span>
                      <span>·</span>
                      <span title={`Medio plazo: ${cause.midTermOutlook.label}`}>
                        Medio: <strong className={cause.midTermOutlook.trend === 'AL_ALZA' ? 'text-emerald-700' : 'text-slate-700'}>{cause.midTermOutlook.arrow}</strong>
                      </span>
                      <span>·</span>
                      <span title={`Largo plazo: ${cause.longTermOutlook.label}`}>
                        Largo: <strong className={cause.longTermOutlook.trend === 'AL_ALZA' ? 'text-emerald-700' : 'text-slate-700'}>{cause.longTermOutlook.arrow}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Direct Chart button, Live Price, Change & Chevron */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Direct Ver Gráfico Button on the ticket */}
                  {onOpenChart && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChart({
                          ticker: cause.ticker,
                          name: cause.name,
                          tradingViewSymbol: cause.tradingViewSymbol,
                          price: activePrice,
                          change: liveQuote.change,
                          trafficLight: cause.trafficLight,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                      title={`Ver gráfico en tiempo real de ${cause.ticker}`}
                    >
                      <Activity className="w-3.5 h-3.5 text-purple-700" />
                      <span className="hidden sm:inline">Gráfico</span>
                    </button>
                  )}

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Cotización en tiempo real"></span>
                      <span className="font-bold text-sm text-[#191C21] font-mono block">
                        {liveQuote.price}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-semibold ${
                      liveQuote.isPositive ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {liveQuote.change}
                    </span>
                  </div>

                  <div className={`p-1.5 rounded-lg text-slate-400 transition-transform ${isExpanded ? 'rotate-180 bg-slate-100' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Expanded Detail Panel (Smooth Accordion Body) */}
              {isExpanded && (
                <div className="border-t border-[#EFECE4] bg-[#FDFCF9] p-4 sm:p-6 space-y-4 animate-fadeIn">
                  {/* Asset Identity Full Header with TradingView Symbol & Live Price Tools */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFECE4]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#191C21] font-mono">
                          {cause.ticker}
                        </h3>
                        <span className="text-sm font-bold text-slate-800">
                          {cause.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>
                          Cotización en Vivo: <strong className="text-[#191C21] font-mono text-sm">{liveQuote.price}</strong>
                          <span className={`ml-1 font-mono font-bold ${liveQuote.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                            ({liveQuote.change})
                          </span>
                        </span>
                        <span>·</span>
                        <span className="px-2 py-0.5 rounded bg-[#EFECE4] text-slate-700 font-mono text-[11px]">
                          {cause.exchange} ({cause.tradingViewSymbol})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Interactive Chart */}
                      {onOpenChart && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChart({
                              ticker: cause.ticker,
                              name: cause.name,
                              tradingViewSymbol: resolveTradingViewSymbol(cause.ticker, cause.tradingViewSymbol),
                              price: activePrice,
                              change: liveQuote.change,
                              trafficLight: cause.trafficLight,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                          title="Abrir gráfico interactivo en tiempo real"
                        >
                          <Activity className="w-3.5 h-3.5 text-purple-700" />
                          <span>Ver Gráfico</span>
                        </button>
                      )}

                      {/* TradingView Direct Link */}
                      <a
                        href={`https://es.tradingview.com/symbols/${encodeURIComponent(resolveTradingViewSymbol(cause.ticker, cause.tradingViewSymbol).replace(':', '-'))}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition flex items-center gap-1"
                        title="Ver ficha y cotización en tiempo real en TradingView oficial"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">TradingView Oficial</span>
                      </a>

                      {/* Adjust Price Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPriceTicker(ticker);
                          setEditingPriceVal(customPrices[ticker] || cause.price);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-slate-100 text-slate-700 border border-[#DDD8CD] text-xs font-semibold transition cursor-pointer"
                        title="Ajustar precio manualmente"
                      >
                        ✏️ Ajustar
                      </button>

                      {getTrafficLightBadge(cause.trafficLight)}
                    </div>
                  </div>

                  {/* Inline Price Editor Drawer */}
                  {editingPriceTicker === ticker && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300 text-xs space-y-2 animate-fadeIn">
                      <span className="font-semibold text-amber-900 block">
                        Ajustar cotización de {cause.ticker} según tu TradingView / Broker:
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingPriceVal}
                          onChange={(e) => setEditingPriceVal(e.target.value)}
                          placeholder="ej. 0.3610 € o $584.50"
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-mono text-xs focus:outline-none focus:border-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveCustomPrice(ticker)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition cursor-pointer"
                        >
                          Guardar Precio
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPriceTicker(null)}
                          className="px-2 py-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Traffic light reason header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#F5F2EB] border border-[#E7E2D8]">
                    <span className="text-xs text-slate-700 font-medium">
                      {cause.trafficLightReason}
                    </span>

                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider self-start sm:self-auto ${
                      cause.classification === 'SEÑAL_FUNDAMENTAL' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cause.classification === 'SEÑAL_FUNDAMENTAL' ? 'Señal Tangible' : 'Ruido / Rotación'}
                    </span>
                  </div>

                  {/* 1. HORIZON PREVIEW (Corto, Medio y Largo Plazo con Flechas) */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Previsiones por Plazo
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {getOutlookBadge(cause.shortTermOutlook)}
                      {getOutlookBadge(cause.midTermOutlook)}
                      {getOutlookBadge(cause.longTermOutlook)}
                    </div>
                  </div>

                  {/* 2. ROOT CAUSE VS NOISE FILTER */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1.5">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> ¿Por qué se mueve hoy?
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {cause.rootCause}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-[#DDD8CD] space-y-1.5">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Filtro de Ruido & Prensa
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {cause.noiseExplanation}
                      </p>
                    </div>
                  </div>

                  {/* 3. TANGIBLE BALANCE HEALTH METRICS */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Salud Contable & Financiera
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-[#E7E2D8] space-y-1">
                        <span className="text-[11px] text-slate-500 font-semibold block">EBITDA & Márgenes</span>
                        <p className="text-xs font-medium text-slate-800">{cause.ebitdaImpact}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E7E2D8] space-y-1">
                        <span className="text-[11px] text-slate-500 font-semibold block">Deuda & Solvencia</span>
                        <p className="text-xs font-medium text-slate-800">{cause.debtSolvencyImpact}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E7E2D8] space-y-1">
                        <span className="text-[11px] text-slate-500 font-semibold block">Flujo de Caja Libre (FCF)</span>
                        <p className="text-xs font-medium text-slate-800">{cause.cashFlowImpact}</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. BOTTOM LINE VERDICT */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                        Veredicto:
                      </strong>
                      <p className="text-xs text-slate-800 leading-relaxed">
                        {cause.verdict}
                      </p>
                    </div>
                  </div>

                  {/* 5. INTERACTIVE AI CHATBOT CONSULTANT */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        Consultor IA ({cause.ticker})
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenAIConsultantTicker(openAIConsultantTicker === ticker ? null : ticker)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition cursor-pointer"
                      >
                        {openAIConsultantTicker === ticker ? 'Ocultar Chat' : 'Abrir Chat con la IA'}
                      </button>
                    </div>

                    {openAIConsultantTicker === ticker && (
                      <TickerAIConsultant
                        cause={{
                          ...cause,
                          price: customPrices[ticker] || cause.price,
                        }}
                      />
                    )}
                  </div>

                  {/* Actions for this item */}
                  <div className="flex items-center justify-end pt-2 border-t border-[#EFECE4] text-xs">
                    <button
                      type="button"
                      onClick={(e) => removeTickerFromWatchlist(e, ticker)}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer text-xs"
                      title="Quitar activo de la lista"
                    >
                      Quitar activo
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

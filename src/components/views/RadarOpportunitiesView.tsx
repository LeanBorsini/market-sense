/**
 * RadarOpportunitiesView Component
 * 
 * Autonomous scanner monitoring deep value and asymmetric turnaround plays.
 * Highlights:
 * 1. Small Cap tech suppliers indispensable to Big Tech.
 * 2. Panic turnarounds trading below physical asset liquidation value.
 * 3. Silent monopolies (e.g. Sony CMOS sensors, ASML lithography, Toyota cash-flows).
 * 4. Sober mathematical asymmetry visualizer with explicit time horizons.
 * 5. Interactive Brokers (IBKR) direct spot accessibility.
 */

import React from 'react';
import { Sparkles, RefreshCw, CheckCircle, Search, Plus, Check } from 'lucide-react';
import { OPPORTUNITIES_DATABASE, OpportunityScan, GemType } from '../../data/assets';
import { AsymmetryVisualizer, createAsymmetryMetrics } from '../AsymmetryVisualizer';
import { LiveQuote, RadarGemFilter } from '../../types/market';

interface RadarOpportunitiesViewProps {
  radarLastScan: string;
  isScanningRadar: boolean;
  onTriggerGlobalScan: () => Promise<void>;
  radarSuccessNotice: string | null;
  gemTypeFilter: RadarGemFilter;
  setGemTypeFilter: (filter: RadarGemFilter) => void;
  trackedTickers: string[];
  getTickerLiveQuote: (ticker: string, fallbackPrice: string, fallbackChange?: string, fallbackPositive?: boolean) => LiveQuote;
  onQuickAuditTicker: (ticker: string) => void;
  onAddTickerToWatchlist: (ticker: string) => void;
  opportunities?: OpportunityScan[];
}

export const RadarOpportunitiesView: React.FC<RadarOpportunitiesViewProps> = ({
  radarLastScan,
  isScanningRadar,
  onTriggerGlobalScan,
  radarSuccessNotice,
  gemTypeFilter,
  setGemTypeFilter,
  trackedTickers,
  getTickerLiveQuote,
  onQuickAuditTicker,
  onAddTickerToWatchlist,
  opportunities = OPPORTUNITIES_DATABASE,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Global Scanner Trigger */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  <span>Escáner Autónomo 24/7</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Último rastreo: {radarLastScan}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Radar de Oportunidades & Asimetrías
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
                Rastreo global de activos con balances sólidos y fuerte potencial de revalorización asimétrica.
              </p>
            </div>

            <button
              type="button"
              onClick={onTriggerGlobalScan}
              disabled={isScanningRadar}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isScanningRadar ? 'animate-spin' : ''}`} />
              <span>{isScanningRadar ? 'Escaneando...' : 'Escanear Bolsas'}</span>
            </button>
          </div>

          {radarSuccessNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{radarSuccessNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* Universal Capital Management & Strategy Card (Neutral for any investor) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#DDD8CD] space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Gestión de Capital & Asignación de Riesgo
            </h3>
            <p className="text-[11px] text-slate-500">
              Principios institucionales aplicables a cualquier tamaño de cartera.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-white border border-[#E7E2D8] space-y-1">
            <strong className="text-purple-900 font-bold block">1. Regla Proporcional (1% al 5%)</strong>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Destinar <strong>entre un 1% y un 5% de tu cartera</strong> por posición asimétrica para mantener el riesgo matemáticamente acotado.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E7E2D8] space-y-1">
            <strong className="text-sky-900 font-bold block">2. Negociable al Contado (IBKR)</strong>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Activos globales negociables al contado en Interactive Brokers sin apalancamiento ni derivados complejos.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E7E2D8] space-y-1">
            <strong className="text-emerald-900 font-bold block">3. Precio Actual vs. Objetivo</strong>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              El precio verde es la cotización en vivo. La valoración objetivo es una proyección contable basada en la normalización del negocio.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Including Asia & IBKR) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setGemTypeFilter('todos')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap font-semibold ${
            gemTypeFilter === 'todos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#DDD8CD]'
          }`}
        >
          Todas ({opportunities.length})
        </button>

        <button
          type="button"
          onClick={() => setGemTypeFilter('asia_ibkr')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap font-semibold flex items-center gap-1.5 ${
            gemTypeFilter === 'asia_ibkr'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-300'
          }`}
        >
          <span>🌏 Asia & IBKR</span>
        </button>

        <button
          type="button"
          onClick={() => setGemTypeFilter('small_cap_tech')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap font-semibold flex items-center gap-1.5 ${
            gemTypeFilter === 'small_cap_tech'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-purple-900 hover:bg-purple-50 border border-purple-200'
          }`}
        >
          <span>💎 Small Caps Tech</span>
        </button>

        <button
          type="button"
          onClick={() => setGemTypeFilter('panic_turnaround')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap font-semibold flex items-center gap-1.5 ${
            gemTypeFilter === 'panic_turnaround'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-rose-900 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <span>🩸 Caídas de Pánico</span>
        </button>

        <button
          type="button"
          onClick={() => setGemTypeFilter('niche_monopoly')}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap font-semibold flex items-center gap-1.5 ${
            gemTypeFilter === 'niche_monopoly'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-white text-sky-900 hover:bg-sky-50 border border-sky-200'
          }`}
        >
          <span>🛡️ Monopolios de Nicho</span>
        </button>
      </div>

      {/* Opportunities Grid with Live Quotes & Transparent Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities
          .filter(opp => {
            if (gemTypeFilter === 'todos') return true;
            if (gemTypeFilter === 'asia_ibkr') return opp.marketSector === 'Asia & Emergentes';
            return opp.gemType === gemTypeFilter;
          })
          .map(opp => {
            const isAlreadyTracked = trackedTickers.includes(opp.ticker);
            const live = getTickerLiveQuote(opp.ticker, opp.currentPrice);

            return (
              <div 
                key={opp.ticker} 
                className="p-5 rounded-2xl bg-white border border-[#E7E2D8] hover:border-[#DDD8CD] transition shadow-xs space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Ticker, Name, Badge, Live Price */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-base font-extrabold text-[#191C21]">
                          {opp.ticker}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {opp.marketSector}
                        </span>
                        {opp.gemType === 'small_cap_tech' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            💎 Small Cap / M&A
                          </span>
                        )}
                        {opp.gemType === 'panic_turnaround' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            🩸 Turnaround Asimétrico
                          </span>
                        )}
                        {opp.gemType === 'niche_monopoly' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            🛡️ Monopolio Silencioso
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                        {opp.name}
                      </h4>
                      {opp.exchangeAvailableIBKR && (
                        <span className="text-[10.5px] font-mono text-slate-500 block mt-0.5">
                          🏛️ {opp.exchangeAvailableIBKR}
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Cotización en tiempo real"></span>
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {live.price}
                        </span>
                      </div>
                      <span className={`font-mono text-[11px] font-semibold block ${live.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {live.change}
                      </span>
                    </div>
                  </div>

                  {/* Transparent Price Distinction Box: Real vs Projected Target */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">🟢 Precio Actual:</span>
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{live.price}</span>
                      <span className={`text-[11px] font-mono font-semibold ml-1 ${live.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        ({live.change})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-900 block">🎯 Precio Objetivo:</span>
                      <span className="font-mono font-bold text-purple-950 text-xs sm:text-sm">
                        {opp.targetPriceEstimated ? opp.targetPriceEstimated.split(' ')[0] : opp.potentialUpside}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-medium truncate">
                        {opp.potentialUpside}
                      </span>
                    </div>
                  </div>

                  {/* Why is an opportunity (Plain Language) */}
                  <div className="p-3 rounded-xl bg-white border border-[#EDE8DE] space-y-1">
                    <strong className="text-slate-800 text-xs font-bold block">
                      💡 Tesis de Inversión:
                    </strong>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {opp.whyIsOpportunity}
                    </p>
                  </div>

                  {/* Sober Minimalist Asymmetry Visualizer & Anxiety-Free Time Horizon */}
                  <AsymmetryVisualizer 
                    metrics={createAsymmetryMetrics(opp)}
                    currentPriceDisplay={live.price}
                  />

                  {/* Secret Edge / Technology */}
                  {opp.secretEdge && (
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                      <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-700" />
                        <span>Ventaja Competitiva / Patente:</span>
                      </span>
                      <p className="text-xs text-purple-950 leading-relaxed font-medium">
                        {opp.secretEdge}
                      </p>
                    </div>
                  )}

                  {/* Cash Burn & Balance Shield */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">🛡️ Solvencia & Caja:</span>
                      <span className="text-[11px] font-semibold text-emerald-700">Auditado OK</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11.5px]">
                      {opp.cashBurnVerdict || `${opp.ebitdaStrength} · ${opp.debtProfile}`}
                    </p>
                  </div>

                  {/* Universal Proportional Strategy */}
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1 text-xs">
                    <strong className="text-emerald-950 font-bold block flex items-center gap-1">
                      <span>🎯 Asignación Sugerida:</span>
                    </strong>
                    <p className="text-emerald-900 leading-relaxed text-[11.5px]">
                      {opp.allocationStrategy || opp.ticket500Strategy || 'Asignación sugerida del 1% al 4% del capital de tu cartera para mantener el riesgo matemáticamente acotado.'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#F5F2EB] flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onQuickAuditTicker(opp.ticker)}
                    className="px-3 py-1.5 rounded-lg bg-[#EFECE4] hover:bg-[#E5E1D5] text-slate-800 font-semibold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-600" />
                    <span>Auditar con IA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddTickerToWatchlist(opp.ticker)}
                    disabled={isAlreadyTracked}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                      isAlreadyTracked
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                    }`}
                  >
                    {isAlreadyTracked ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                        <span>En tu Cartera</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Fijar en mi Cartera</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

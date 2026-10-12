/**
 * MacroImpactView Component
 * 
 * Presents critical market news filtered through accounting facts.
 * Explains macroeconomic shifts in plain language ("En Cristiano")
 * and filters out media sensationalism by contrasting with official SEC/CNMV filings.
 * 
 * Includes an "Archivo Histórico" tab to navigate past days independently of the latest sync.
 */

import React, { useState, useMemo } from 'react';
import { RefreshCw, CheckCircle, HelpCircle, Archive, Flame, Calendar, Filter, Search } from 'lucide-react';
import { DAILY_MACRO_IMPACT, ARCHIVED_MACRO_NEWS, DailyMacroImpact } from '../../data/marketSignals';

interface MacroImpactViewProps {
  isRefreshingNews: boolean;
  onRefreshNews: () => Promise<void>;
  newsLastSynced: string;
  newsSyncNotice: string | null;
  macroImpacts?: DailyMacroImpact[];
  archivedNews?: DailyMacroImpact[];
  trackedTickers?: string[];
}

export const MacroImpactView: React.FC<MacroImpactViewProps> = ({
  isRefreshingNews,
  onRefreshNews,
  newsLastSynced,
  newsSyncNotice,
  macroImpacts = DAILY_MACRO_IMPACT,
  archivedNews = ARCHIVED_MACRO_NEWS,
  trackedTickers = [],
}) => {
  // Pestaña activa: 'today' (Sesión de hoy en vivo) o 'archive' (Archivo de días anteriores)
  const [activeTab, setActiveTab] = useState<'today' | 'archive'>('today');

  // Filtros para el archivo histórico
  const [selectedArchiveDate, setSelectedArchiveDate] = useState<string>('todos');
  const [archiveSearch, setArchiveSearch] = useState<string>('');
  const [onlyPortfolio, setOnlyPortfolio] = useState<boolean>(false);

  // Lista de fechas únicas disponibles en el archivo
  const availableArchiveDates = useMemo(() => {
    const dates = new Set<string>();
    archivedNews.forEach(item => {
      if (item.date) dates.add(item.date);
    });
    return Array.from(dates);
  }, [archivedNews]);

  // Ordenar noticias de hoy priorizando las que afectan a la cartera
  const sortedTodayImpacts = useMemo(() => {
    let list = [...macroImpacts];
    if (onlyPortfolio) {
      list = list.filter(item => item.affectsTickers.some(t => trackedTickers.includes(t)));
    }
    return list.sort((a, b) => {
      const aMatches = a.affectsTickers.some(t => trackedTickers.includes(t)) ? 1 : 0;
      const bMatches = b.affectsTickers.some(t => trackedTickers.includes(t)) ? 1 : 0;
      return bMatches - aMatches;
    });
  }, [macroImpacts, trackedTickers, onlyPortfolio]);

  // Filtrar y ordenar noticias del archivo histórico
  const filteredArchiveNews = useMemo(() => {
    return archivedNews.filter(item => {
      // Filtro por fecha seleccionada
      if (selectedArchiveDate !== 'todos' && item.date !== selectedArchiveDate) {
        return false;
      }
      // Filtro solo cartera
      if (onlyPortfolio) {
        const matchesPortfolio = item.affectsTickers.some(t => trackedTickers.includes(t));
        if (!matchesPortfolio) return false;
      }
      // Filtro por búsqueda de texto
      if (archiveSearch.trim()) {
        const q = archiveSearch.toLowerCase();
        const matchesText = 
          item.title.toLowerCase().includes(q) || 
          item.plainLanguage.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          item.affectsTickers.some(t => t.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q);
        if (!matchesText) return false;
      }
      return true;
    });
  }, [archivedNews, selectedArchiveDate, onlyPortfolio, archiveSearch, trackedTickers]);

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

  const currentDisplayList = activeTab === 'today' ? sortedTodayImpacts : filteredArchiveNews;

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
              {activeTab === 'today' ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>En Vivo</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  <Archive className="w-3 h-3" />
                  <span>Hemeroteca</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hechos relevantes y noticias contrastadas con balances oficiales.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'today' && (
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
            )}
          </div>
        </div>

        {/* Navigation Tabs: Sesión de Hoy vs Archivo Histórico */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-[#FAF8F5] border border-[#EDE8DE] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-white text-emerald-900 shadow-2xs border border-[#DDD8CD]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sesión de Hoy</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                {macroImpacts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('archive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'archive'
                  ? 'bg-white text-amber-950 shadow-2xs border border-[#DDD8CD]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-700" />
              <span>Archivo de Noticias</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono">
                {archivedNews.length}
              </span>
            </button>
          </div>

          {/* Quick toggle: Solo mi cartera */}
          <button
            type="button"
            onClick={() => setOnlyPortfolio(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
              onlyPortfolio
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                : 'bg-white text-slate-600 border-[#EDE8DE] hover:bg-slate-50'
            }`}
          >
            <span>🎯 Solo mi cartera</span>
            {onlyPortfolio && <span className="text-[10px]">✓</span>}
          </button>
        </div>

        {/* Sync Metadata (Active in Today tab) */}
        {activeTab === 'today' && (
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800">Última comprobación:</span>
              <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#DDD8CD] font-mono text-emerald-800 font-bold">
                {newsLastSynced}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px]">
              <span>⚡ Actualización continua en tiempo real y campanas bursátiles (09:00, 15:30, 20:00 y 22:00 CET)</span>
            </div>
          </div>
        )}

        {/* Sub-Filters Toolbar for Archive Tab */}
        {activeTab === 'archive' && (
          <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Fecha:</span>
              </span>
              <select
                value={selectedArchiveDate}
                onChange={(e) => setSelectedArchiveDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#DDD8CD] text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="todos">Todas las fechas registradas ({archivedNews.length})</option>
                {availableArchiveDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                placeholder="Buscar por titular o ticker..."
                className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#DDD8CD] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {newsSyncNotice && (
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{newsSyncNotice}</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {currentDisplayList.length === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E7E2D8] space-y-2">
          <Archive className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No se encontraron noticias con los filtros actuales</h3>
          <p className="text-xs text-slate-500">Prueba a seleccionar "Todas las fechas" o desmarcar el filtro de cartera.</p>
        </div>
      )}

      {/* News Cards with Prominent Date & Source Auditing */}
      <div className="space-y-3.5">
        {currentDisplayList.map(item => {
          const matchingTickers = item.affectsTickers.filter(t => trackedTickers.includes(t));
          const isPortfolioImpact = matchingTickers.length > 0;

          return (
            <div 
              key={item.id} 
              className={`p-5 rounded-2xl bg-white border transition shadow-xs space-y-3.5 ${
                isPortfolioImpact 
                  ? 'border-emerald-300 ring-1 ring-emerald-600/10' 
                  : 'border-[#E7E2D8]'
              }`}
            >
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

                <div className="flex items-center gap-2 flex-wrap">
                  {isPortfolioImpact && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1">
                      <span>🎯 Afecta a tu Cartera ({matchingTickers.join(', ')})</span>
                    </span>
                  )}

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${
                    item.statusBadge.includes('Archivo')
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.statusBadge.includes('Archivo') ? 'bg-amber-600' : 'bg-emerald-600'}`}></span>
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
            <div className="flex items-center justify-between gap-1.5 text-[11px] text-slate-500 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#EDE8DE]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-slate-700">🏛️ Fuente:</span>
                <span className="text-slate-800 truncate">{item.source}</span>
              </div>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold shrink-0"
                >
                  Leer noticia ↗
                </a>
              )}
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
        );
      })}
      </div>
    </div>
  );
};

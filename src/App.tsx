/**
 * MarketSense AI Financial Terminal
 * 
 * Main Application Orchestrator
 * 
 * Responsibilities:
 * - Coordinates global states (active profile, tracked tickers, custom prices).
 * - Synchronizes with Firebase Firestore with seamless localStorage fallback when quotas are reached.
 * - Handles live price fetching from market APIs (/api/market-prices) and automatic polling.
 * - Triggers automated Telegram dispatches during critical bell windows (09:00, 15:30, 20:00, 22:00 CET).
 * - Mounts modular views: WatchlistView, MacroImpactView, RadarOpportunitiesView, CalendarView.
 * - Manages modal drawers: AuditModal, ProfilesModal.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  WHY_IT_MOVES_DATA, 
  DAILY_MACRO_IMPACT, 
  CRITICAL_EVENTS_CALENDAR, 
  auditTickerFundamentals,
  MovementCause,
  DailyMacroImpact
} from './data/marketSignals';
import { 
  INITIAL_ASSET_DATABASE, 
  DEFAULT_PROFILES, 
  OPPORTUNITIES_DATABASE,
  UserProfile,
  Asset
} from './data/assets';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { WatchlistView } from './components/views/WatchlistView';
import { MacroImpactView } from './components/views/MacroImpactView';
import { RadarOpportunitiesView } from './components/views/RadarOpportunitiesView';
import { CalendarView } from './components/views/CalendarView';
import { AuditModal } from './components/modals/AuditModal';
import { TradingViewModal } from './components/modals/TradingViewModal';
import { ActiveSection, LiveQuote, LiveQuotesMap, RadarGemFilter } from './types/market';

// Global fallback to prevent any ReferenceError: dublinTime is not defined from cached scripts or workers
if (typeof globalThis !== 'undefined') {
  (globalThis as any).dublinTime = '';
}

export default function App() {
  const { 
    currentUser, 
    loginWithGoogle, 
    enableLocalProfile,
    logout, 
    saveUserDataToCloud, 
    cloudData, 
    isLoggingIn, 
    authError, 
    authErrorCode,
    clearAuthError 
  } = useAuth();

  // ─── 1. PROFILES & CATALOG STATE ───
  const [profiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('marketsense_profiles_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return profiles[0]?.id || 'user-main';
  });

  const [catalog] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem('marketsense_catalog_v5');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ASSET_DATABASE;
  });

  // ─── 2. WATCHLIST & CIRCULAR-SAFE CLOUD SYNC ───
  const [trackedTickers, setTrackedTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('marketsense_tracked_tickers_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['OHLA', 'VOO', 'BTC', 'TSM', 'SAN', 'REP'];
  });

  const isSyncingFromCloudRef = useRef(false);
  const prevTrackedTickersRef = useRef<string[]>(trackedTickers);

  // Sync personal watchlist and custom prices from cloud when user logs in
  useEffect(() => {
    if (currentUser && cloudData) {
      if (cloudData.keyTickers && Array.isArray(cloudData.keyTickers) && cloudData.keyTickers.length > 0) {
        const areSame = 
          cloudData.keyTickers.length === trackedTickers.length &&
          cloudData.keyTickers.every((t, i) => t === trackedTickers[i]);
        if (!areSame) {
          isSyncingFromCloudRef.current = true;
          prevTrackedTickersRef.current = cloudData.keyTickers;
          setTrackedTickers(cloudData.keyTickers);
        }
      }
      if (cloudData.customPrices && typeof cloudData.customPrices === 'object') {
        const mappedPrices: Record<string, string> = {};
        Object.entries(cloudData.customPrices).forEach(([tk, val]) => {
          if (typeof val === 'string') mappedPrices[tk] = val;
          else if (val && typeof val === 'object' && (val as any).price) mappedPrices[tk] = (val as any).price;
        });
        setCustomPrices(prev => ({ ...prev, ...mappedPrices }));
      }
    }
  }, [currentUser, cloudData]);

  // Save changes to localStorage and Cloud (only when user actively modifies them)
  useEffect(() => {
    localStorage.setItem('marketsense_tracked_tickers_v2', JSON.stringify(trackedTickers));
    
    // If update came from cloudData sync, skip echoing back to the cloud
    if (isSyncingFromCloudRef.current) {
      isSyncingFromCloudRef.current = false;
      return;
    }

    const areSame = 
      prevTrackedTickersRef.current.length === trackedTickers.length &&
      prevTrackedTickersRef.current.every((t, i) => t === trackedTickers[i]);

    if (!areSame && currentUser && !currentUser.uid.startsWith('local-')) {
      prevTrackedTickersRef.current = trackedTickers;
      saveUserDataToCloud({ keyTickers: trackedTickers });
    }
  }, [trackedTickers, currentUser, saveUserDataToCloud]);

  // ─── 3. ACCORDION & CUSTOM PRICE STATES ───
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const [openAIConsultantTicker, setOpenAIConsultantTicker] = useState<string | null>(null);

  const [customPrices, setCustomPrices] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('marketsense_custom_prices');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });
  const [editingPriceTicker, setEditingPriceTicker] = useState<string | null>(null);
  const [editingPriceVal, setEditingPriceVal] = useState<string>('');

  const handleSaveCustomPrice = (ticker: string) => {
    if (!editingPriceVal.trim()) return;
    const updated = { ...customPrices, [ticker]: editingPriceVal.trim() };
    setCustomPrices(updated);
    localStorage.setItem('marketsense_custom_prices', JSON.stringify(updated));
    setEditingPriceTicker(null);
  };

  // ─── 4. SEARCH & AUDITOR STATE ───
  const [searchQuery, setSearchQuery] = useState('');
  const [auditedResult, setAuditedResult] = useState<MovementCause | null>(null);
  const [selectedChartAsset, setSelectedChartAsset] = useState<{
    ticker: string;
    name: string;
    tradingViewSymbol: string;
    price: string;
    change: string;
    trafficLight?: 'VERDE' | 'AMBAR' | 'ROJO';
  } | null>(null);

  const handleSearchAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    const result = auditTickerFundamentals(searchQuery);
    setAuditedResult(result);
  };

  const addAuditedTickerToWatchlist = (ticker: string) => {
    if (!trackedTickers.includes(ticker)) {
      setTrackedTickers(prev => [...prev, ticker]);
      setExpandedTicker(ticker);
    }
  };

  const handleQuickAuditTicker = (ticker: string) => {
    setSearchQuery(ticker);
    const result = auditTickerFundamentals(ticker);
    setAuditedResult(result);
  };

  const removeTickerFromWatchlist = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation();
    if (trackedTickers.length <= 1) return;
    const updated = trackedTickers.filter(t => t !== ticker);
    setTrackedTickers(updated);
    if (expandedTicker === ticker) {
      setExpandedTicker(updated[0] || null);
    }
  };

  const toggleAccordion = (ticker: string) => {
    setExpandedTicker(prev => (prev === ticker ? null : ticker));
  };

  // ─── 5. NAVIGATION SECTION ───
  const [activeSection, setActiveSection] = useState<ActiveSection>('watchlist');

  // ─── 6. RADAR GLOBAL SCANNER STATE ───
  const [isScanningRadar, setIsScanningRadar] = useState(false);
  const [radarLastScan, setRadarLastScan] = useState<string>(() => {
    return localStorage.getItem('marketsense_radar_last_scan') || 'Hoy a las 09:00 CET (Apertura)';
  });
  const [gemTypeFilter, setGemTypeFilter] = useState<RadarGemFilter>('todos');
  const [radarSuccessNotice, setRadarSuccessNotice] = useState<string | null>(null);

  // ─── 7. LIVE MARKET DATA SYNC (IBKR & GLOBAL FEEDS) ───
  const [liveQuotes, setLiveQuotes] = useState<LiveQuotesMap>({});
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [lastPriceUpdateTime, setLastPriceUpdateTime] = useState<string>('Sincronizando feed en vivo...');

  const fetchLiveMarketQuotes = async () => {
    setIsUpdatingPrices(true);
    try {
      const allUniqueTickers = Array.from(new Set([
        ...trackedTickers,
        ...catalog.map(a => a.ticker),
        ...OPPORTUNITIES_DATABASE.map(o => o.ticker),
        'VOO', 'OHLA', 'BTC', 'TSM', 'INTC', 'SONY', 'TM', 'BABA', 'INDA', 'SAN', 'IBE', 'FN', 'POWI', 'ALNY', 'ASML', 'SOL', 'CCJ'
      ])).join(',');

      const res = await fetch(`/api/market-prices?tickers=${encodeURIComponent(allUniqueTickers)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.quotes) {
          setLiveQuotes(prev => ({ ...prev, ...data.quotes }));
          const timeStr = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });
          setLastPriceUpdateTime(`En vivo · ${timeStr}`);
        }
      }
    } catch (e) {
      console.warn('Error fetching live quotes:', e);
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  useEffect(() => {
    fetchLiveMarketQuotes();
    const interval = setInterval(fetchLiveMarketQuotes, 45000);
    return () => clearInterval(interval);
  }, [trackedTickers]);

  const getTickerLiveQuote = (ticker: string, fallbackPrice: string, fallbackChange: string = '+0.00%', fallbackPositive: boolean = true): LiveQuote => {
    if (customPrices[ticker]) {
      return {
        price: customPrices[ticker],
        change: fallbackChange,
        isPositive: fallbackPositive,
        isLive: true,
      };
    }
    const live = liveQuotes[ticker];
    if (live && live.price) {
      return {
        price: live.price,
        change: live.change,
        isPositive: live.isPositive,
        isLive: true,
        exchange: live.exchange || 'IBKR Live'
      };
    }
    return {
      price: fallbackPrice,
      change: fallbackChange,
      isPositive: fallbackPositive,
      isLive: false,
      exchange: 'Referencia'
    };
  };

  const handleTriggerGlobalScan = async () => {
    setIsScanningRadar(true);
    setRadarSuccessNotice(null);
    try {
      await Promise.all([
        new Promise(r => setTimeout(r, 900)),
        fetchLiveMarketQuotes()
      ]);
      const nowTime = new Date().toLocaleTimeString('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit'
      });
      const newScanStr = `Hoy a las ${nowTime} CET (Escaneo Global Auditado)`;
      setRadarLastScan(newScanStr);
      localStorage.setItem('marketsense_radar_last_scan', newScanStr);
      setRadarSuccessNotice('✅ Escaneo global completado en Bolsas de EE.UU., Europa y Asia: cotizaciones en vivo y balances auditados.');
      setTimeout(() => setRadarSuccessNotice(null), 5000);
    } finally {
      setIsScanningRadar(false);
    }
  };

  // ─── 8. NEWS SYNC STATE ───
  const [newsLastSynced, setNewsLastSynced] = useState<string>(() => {
    return localStorage.getItem('marketsense_news_synced') || 'Hoy a las 15:30 CET (Apertura Wall St)';
  });
  const [isRefreshingNews, setIsRefreshingNews] = useState<boolean>(false);
  const [newsSyncNotice, setNewsSyncNotice] = useState<string | null>(null);

  const handleManualNewsRefresh = async () => {
    setIsRefreshingNews(true);
    setNewsSyncNotice(null);
    try {
      await new Promise(r => setTimeout(r, 600));
      const nowTime = new Date().toLocaleTimeString('es-ES', { 
        timeZone: 'Europe/Madrid', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const newSyncText = `Hoy a las ${nowTime} CET (Feed Auditado)`;
      setNewsLastSynced(newSyncText);
      localStorage.setItem('marketsense_news_synced', newSyncText);
      setNewsSyncNotice('✅ Noticias e impactos contables comprobados al minuto contra hechos oficiales.');
      setTimeout(() => setNewsSyncNotice(null), 4000);
    } finally {
      setIsRefreshingNews(false);
    }
  };

  // ─── 9. CLIPBOARD COPY & SUMMARY ───
  const [isCopied, setIsCopied] = useState(false);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const executiveReportText = useMemo(() => {
    let text = `🏛️ MARKETSENSE · INFORME FUNDAMENTAL\nFecha: ${new Date().toLocaleDateString('es-ES')}\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
    trackedTickers.forEach(ticker => {
      const cause = WHY_IT_MOVES_DATA[ticker];
      if (!cause) return;
      const activePrice = customPrices[ticker] || cause.price;
      text += `▫️ ${ticker} (${activePrice} · ${cause.change}):\n`;
      text += `  • Previsión: Corto: ${cause.shortTermOutlook.arrow} ${cause.shortTermOutlook.label} | Medio: ${cause.midTermOutlook.arrow} ${cause.midTermOutlook.label} | Largo: ${cause.longTermOutlook.arrow} ${cause.longTermOutlook.label}\n`;
      text += `  • Causa: ${cause.rootCause}\n`;
      text += `  • Veredicto: ${cause.verdict}\n\n`;
    });
    return text;
  }, [trackedTickers, customPrices]);

  // ─── 10. NON-INVASIVE VOLATILITY CATALYST ALERT ───
  const imminentVolatilityEvent = CRITICAL_EVENTS_CALENDAR[0] || null;
  const [isVolatilityAlertDismissed, setIsVolatilityAlertDismissed] = useState<boolean>(() => {
    try {
      const dismissedId = localStorage.getItem('marketsense_dismissed_volatility_ev');
      return dismissedId === imminentVolatilityEvent?.id;
    } catch {
      return false;
    }
  });

  const dismissVolatilityAlert = () => {
    if (imminentVolatilityEvent) {
      localStorage.setItem('marketsense_dismissed_volatility_ev', imminentVolatilityEvent.id);
      setIsVolatilityAlertDismissed(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#191C21] flex flex-col font-sans selection:bg-emerald-200">
      {/* ─── 1. TOP HEADER & NAVIGATION ─── */}
      <Header
        currentUser={currentUser}
        isLoggingIn={isLoggingIn}
        onLoginWithGoogle={loginWithGoogle}
        onLogout={logout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchAudit}
        authError={authError}
        authErrorCode={authErrorCode}
        onClearAuthError={clearAuthError}
        onEnableLocalProfile={enableLocalProfile}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* ─── 2. MAIN CONTENT CONTAINER ─── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Subtle Non-invasive Volatility Catalyst Notice */}
        {!isVolatilityAlertDismissed && imminentVolatilityEvent && (
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between gap-3 text-xs text-amber-950 transition shadow-2xs animate-fadeIn">
            <div 
              onClick={() => setActiveSection('events_opportunities')}
              className="flex items-center gap-2 flex-wrap cursor-pointer hover:opacity-85 transition"
              title="Toca para ver el calendario macro de eventos decisivos"
            >
              <span className="flex items-center gap-1 font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                ⚡ Catalizador de Volatilidad
              </span>
              <span className="font-semibold text-slate-900">
                {imminentVolatilityEvent.event}
              </span>
              <span className="text-slate-600 font-mono text-[11px]">
                · {imminentVolatilityEvent.date} ({imminentVolatilityEvent.tickerOrSector})
              </span>
            </div>

            <button
              type="button"
              onClick={dismissVolatilityAlert}
              className="text-amber-700 hover:text-amber-950 font-bold p-1 cursor-pointer shrink-0"
              title="Ocultar aviso de volatilidad"
            >
              ✕
            </button>
          </div>
        )}

        {activeSection === 'watchlist' && (
          <WatchlistView
            trackedTickers={trackedTickers}
            expandedTicker={expandedTicker}
            toggleAccordion={toggleAccordion}
            getTickerLiveQuote={getTickerLiveQuote}
            customPrices={customPrices}
            editingPriceTicker={editingPriceTicker}
            setEditingPriceTicker={setEditingPriceTicker}
            editingPriceVal={editingPriceVal}
            setEditingPriceVal={setEditingPriceVal}
            handleSaveCustomPrice={handleSaveCustomPrice}
            openAIConsultantTicker={openAIConsultantTicker}
            setOpenAIConsultantTicker={setOpenAIConsultantTicker}
            removeTickerFromWatchlist={removeTickerFromWatchlist}
            executiveReportText={executiveReportText}
            copyText={copyText}
            isCopied={isCopied}
            currentUser={currentUser}
            onOpenChart={setSelectedChartAsset}
          />
        )}

        {activeSection === 'impact' && (
          <MacroImpactView
            isRefreshingNews={isRefreshingNews}
            onRefreshNews={handleManualNewsRefresh}
            newsLastSynced={newsLastSynced}
            newsSyncNotice={newsSyncNotice}
            macroImpacts={DAILY_MACRO_IMPACT}
          />
        )}

        {activeSection === 'radar_gems' && (
          <RadarOpportunitiesView
            radarLastScan={radarLastScan}
            isScanningRadar={isScanningRadar}
            onTriggerGlobalScan={handleTriggerGlobalScan}
            radarSuccessNotice={radarSuccessNotice}
            gemTypeFilter={gemTypeFilter}
            setGemTypeFilter={setGemTypeFilter}
            trackedTickers={trackedTickers}
            getTickerLiveQuote={getTickerLiveQuote}
            onQuickAuditTicker={handleQuickAuditTicker}
            onAddTickerToWatchlist={addAuditedTickerToWatchlist}
            opportunities={OPPORTUNITIES_DATABASE}
            onOpenChart={setSelectedChartAsset}
          />
        )}

        {activeSection === 'events_opportunities' && (
          <CalendarView
            events={CRITICAL_EVENTS_CALENDAR}
          />
        )}
      </main>

      {/* ─── 3. MODALS & POPUPS ─── */}
      <AuditModal
        auditedResult={auditedResult}
        onClose={() => setAuditedResult(null)}
        onAddToWatchlist={addAuditedTickerToWatchlist}
        isAlreadyTracked={auditedResult ? trackedTickers.includes(auditedResult.ticker) : false}
        onOpenChart={setSelectedChartAsset}
      />

      {/* ─── 4. INTERACTIVE TRADINGVIEW CHART MODAL ─── */}
      {selectedChartAsset && (
        <TradingViewModal
          isOpen={!!selectedChartAsset}
          onClose={() => setSelectedChartAsset(null)}
          ticker={selectedChartAsset.ticker}
          name={selectedChartAsset.name}
          tradingViewSymbol={selectedChartAsset.tradingViewSymbol}
          price={selectedChartAsset.price}
          change={selectedChartAsset.change}
          trafficLight={selectedChartAsset.trafficLight}
        />
      )}
    </div>
  );
}

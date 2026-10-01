import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Search, 
  Clock, 
  Zap, 
  Check, 
  Copy, 
  Send, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Settings,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Globe
} from 'lucide-react';
import { 
  Asset, 
  UserProfile, 
  INITIAL_ASSET_DATABASE, 
  OPPORTUNITIES_DATABASE, 
  OpportunityScan, 
  DEFAULT_PROFILES 
} from './data/assets';
import { 
  WHY_IT_MOVES_DATA, 
  DAILY_MACRO_IMPACT, 
  CRITICAL_EVENTS_CALENDAR, 
  GLOBAL_MARKET_PULSE, 
  auditTickerFundamentals,
  MovementCause,
  HorizonOutlook 
} from './data/marketSignals';
import { TickerAIConsultant } from './components/TickerAIConsultant';
import { PWAInstallButton } from './components/PWAInstallButton';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { currentUser, loginWithGoogle, logout, saveUserDataToCloud, cloudData } = useAuth();

  // Profiles State
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
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

  const currentProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  // Master asset catalog
  const [catalog, setCatalog] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem('marketsense_catalog_v5');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ASSET_DATABASE;
  });

  // Tickers in tracking list (OHLA, VOO, BTC, TSM, etc.)
  const [trackedTickers, setTrackedTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('marketsense_tracked_tickers_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['OHLA', 'VOO', 'BTC', 'TSM', 'SAN', 'REP'];
  });

  // Sync personal watchlist and custom prices from cloud when user logs in
  useEffect(() => {
    if (currentUser && cloudData) {
      if (cloudData.keyTickers && Array.isArray(cloudData.keyTickers) && cloudData.keyTickers.length > 0) {
        setTrackedTickers(cloudData.keyTickers);
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

  // Save changes to localStorage and Cloud (if logged in)
  useEffect(() => {
    localStorage.setItem('marketsense_tracked_tickers_v2', JSON.stringify(trackedTickers));
    if (currentUser) {
      saveUserDataToCloud({ keyTickers: trackedTickers });
    }
  }, [trackedTickers, currentUser]);

  // Accordion state: which ticker is currently expanded (null = none)
  const [expandedTicker, setExpandedTicker] = useState<string | null>('OHLA');

  // AI Consultant state per ticker (which ticker has the AI consultant open)
  const [openAIConsultantTicker, setOpenAIConsultantTicker] = useState<string | null>('OHLA');

  // Custom user prices synced with live TradingView
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

  // Universal Search & Auditor for ANY ticker in the world
  const [searchQuery, setSearchQuery] = useState('');
  const [auditedResult, setAuditedResult] = useState<MovementCause | null>(null);

  // Active Main Navigation Tab (Streamlined to 3 core sections)
  // 'watchlist': Lista Vertical con Acordeones Desplegables & Previsiones
  // 'impact': Impacto de la Jornada (Explicado para no técnicos)
  // 'events_opportunities': Eventos Decisivos & Oportunidades Globales
  const [activeSection, setActiveSection] = useState<'watchlist' | 'impact' | 'events_opportunities'>('watchlist');

  // Telegram Configuration
  const [customBotToken, setCustomBotToken] = useState<string>(() => {
    return localStorage.getItem('marketsense_tg_token') || '';
  });
  const [customChatId, setCustomChatId] = useState<string>(() => {
    return localStorage.getItem('marketsense_tg_chatid') || '';
  });
  const [chatDisplayName, setChatDisplayName] = useState<string>(() => {
    return localStorage.getItem('marketsense_tg_display_name') || 'Market_sense';
  });
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('marketsense_tg_auto_dispatch');
    return saved !== null ? saved === 'true' : true;
  });
  const [lastAutoDispatchWindow, setLastAutoDispatchWindow] = useState<string>(() => {
    return localStorage.getItem('marketsense_last_auto_window') || '';
  });

  const [isTelegramSettingsOpen, setIsTelegramSettingsOpen] = useState(false);
  const [telegramStatusNotice, setTelegramStatusNotice] = useState<string | null>(null);
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [showBotGuide, setShowBotGuide] = useState(false);
  const [showCronGuide, setShowCronGuide] = useState(false);
  const [isDetectingChatId, setIsDetectingChatId] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);

  // Auto-detect Telegram Group or Channel Chat ID via getUpdates
  const detectChatIdAutomatically = async () => {
    if (!customBotToken.trim()) {
      setDetectStatus('⚠️ Primero pega tu Bot Token arriba.');
      return;
    }
    setIsDetectingChatId(true);
    setDetectStatus(null);
    try {
      const res = await fetch(`https://api.telegram.org/bot${customBotToken.trim()}/getUpdates`);
      const data = await res.json();
      if (!data.ok) {
        setDetectStatus(`❌ Error del bot: ${data.description}`);
        return;
      }
      
      const updates = data.result || [];
      if (updates.length === 0) {
        setDetectStatus('💡 El bot no ha detectado mensajes recientes. Entra a tu grupo en Telegram (Market_sense), escribe cualquier palabra (ej. "hola") y vuelve a pulsar este botón.');
        return;
      }

      // Search updates in reverse to find the most recent chat ID
      let foundChatId: string | null = null;
      let foundTitle: string = '';

      for (let i = updates.length - 1; i >= 0; i--) {
        const u = updates[i];
        const chat = u.message?.chat || u.my_chat_member?.chat || u.channel_post?.chat;
        if (chat && chat.id) {
          foundChatId = String(chat.id);
          foundTitle = chat.title || chat.username || chat.first_name || 'Market_sense';
          break;
        }
      }

      if (foundChatId) {
        setCustomChatId(foundChatId);
        localStorage.setItem('marketsense_tg_chatid', foundChatId);
        if (foundTitle && foundTitle !== 'Grupo') {
          setChatDisplayName(foundTitle);
          localStorage.setItem('marketsense_tg_display_name', foundTitle);
        }
        setDetectStatus(`✅ ¡Detectado con éxito! Grupo: "${foundTitle}" (ID: ${foundChatId}). Ya puedes pulsar Guardar y Enviar.`);
      } else {
        setDetectStatus('💡 Escribe un mensaje de prueba (ej. "hola") dentro de tu grupo de Telegram y vuelve a pulsar.');
      }
    } catch (err: any) {
      setDetectStatus(`❌ Error de conexión: ${err.message || 'Verifica tu red'}`);
    } finally {
      setIsDetectingChatId(false);
    }
  };

  // Dynamic Clock State (Default: device local time, with 1-click toggle to Wall St & Europe)
  type ClockMode = 'local' | 'ny' | 'dublin';
  const [clockMode, setClockMode] = useState<ClockMode>(() => {
    return (localStorage.getItem('marketsense_clock_mode') as ClockMode) || 'local';
  });
  const [clockTime, setClockTime] = useState<string>('');

  // Detect user local device city / time zone
  const userCity = useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const raw = tz.split('/')[1] || tz;
      return raw.replace(/_/g, ' ');
    } catch {
      return 'Local';
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (clockMode === 'local') {
        setClockTime(
          now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
        );
      } else if (clockMode === 'ny') {
        setClockTime(
          now.toLocaleTimeString('es-ES', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
        );
      } else {
        setClockTime(
          now.toLocaleTimeString('es-ES', {
            timeZone: 'Europe/Dublin',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
        );
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [clockMode]);

  const toggleClockMode = () => {
    const nextMode: ClockMode = clockMode === 'local' ? 'ny' : clockMode === 'ny' ? 'dublin' : 'local';
    setClockMode(nextMode);
    localStorage.setItem('marketsense_clock_mode', nextMode);
  };

  // Filter for opportunities
  const [oppSectorFilter, setOppSectorFilter] = useState<string>('Todos');

  // Clipboard copy state
  const [isCopied, setIsCopied] = useState(false);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Toggle accordion item
  const toggleAccordion = (ticker: string) => {
    setExpandedTicker(prev => (prev === ticker ? null : ticker));
  };

  // Execute universal ticker audit
  const handleSearchAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    const result = auditTickerFundamentals(searchQuery);
    setAuditedResult(result);
  };

  // Add audited ticker to tracking list
  const addAuditedTickerToWatchlist = (ticker: string) => {
    if (!trackedTickers.includes(ticker)) {
      setTrackedTickers(prev => [...prev, ticker]);
      setExpandedTicker(ticker);
      setTelegramStatusNotice(`Activo ${ticker} añadido a tu lista de seguimiento.`);
    }
  };

  // Remove ticker from tracking
  const removeTickerFromWatchlist = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation();
    if (trackedTickers.length <= 1) return;
    const updated = trackedTickers.filter(t => t !== ticker);
    setTrackedTickers(updated);
    if (expandedTicker === ticker) {
      setExpandedTicker(updated[0] || null);
    }
  };

  // Helper for traffic light styling
  const getTrafficLightBadge = (light: 'VERDE' | 'AMBAR' | 'ROJO', reason?: string) => {
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

  // Helper for trend badge
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

  // Generate clean, high-signal executive briefing text for Telegram
  const executiveReportText = useMemo(() => {
    const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const tzLabel = clockMode === 'local' ? `Local ${userCity}` : clockMode === 'ny' ? 'Wall St (NY)' : 'Dublín';
    let text = `🏛️ MARKETSENSE · INFORME FUNDAMENTAL\n`;
    text += `📅 ${dateStr} · 🕒 ${clockTime} (${tzLabel})\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `🎯 PREVISIONES & CAUSA REAL DE TUS ACTIVOS:\n\n`;
    trackedTickers.forEach(ticker => {
      const cause = WHY_IT_MOVES_DATA[ticker] || auditTickerFundamentals(ticker);
      const activePrice = customPrices[ticker] || cause.price;
      text += `▫️ ${ticker} (${activePrice} · ${cause.change}):\n`;
      text += `  • Previsión: Corto: ${cause.shortTermOutlook.arrow} ${cause.shortTermOutlook.label} | Medio: ${cause.midTermOutlook.arrow} ${cause.midTermOutlook.label} | Largo: ${cause.longTermOutlook.arrow} ${cause.longTermOutlook.label}\n`;
      text += `  • Causa: ${cause.rootCause}\n`;
      text += `  • Filtro de Ruido: ${cause.noiseExplanation}\n`;
      text += `  • Veredicto: ${cause.verdict}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `⚡ LO MÁS RELEVANTE EXPLICADO SIN RUIDO:\n\n`;
    DAILY_MACRO_IMPACT.slice(0, 2).forEach(item => {
      text += `📌 ${item.title}\n`;
      text += `  • En Cristiano: ${item.plainLanguage}\n`;
      text += `  • Afecta a: ${item.affectsTickers.join(', ')}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🔔 PRÓXIMO HITO DECISIVO:\n`;
    const ev = CRITICAL_EVENTS_CALENDAR[0];
    if (ev) {
      text += `• ${ev.date} (${ev.tickerOrSector}): ${ev.event} (Impacto: ${ev.balanceImpact})\n`;
    }

    return text;
  }, [trackedTickers, clockTime, clockMode, userCity, customPrices]);

  // Build a dedicated, high-signal Telegram message for a single asset
  const buildAssetTelegramMessage = (ticker: string): string => {
    const cause = WHY_IT_MOVES_DATA[ticker] || auditTickerFundamentals(ticker);
    const activePrice = customPrices[ticker] || cause.price;
    const trafficEmoji = cause.trafficLight === 'VERDE' ? '🟢' : cause.trafficLight === 'AMBAR' ? '🟡' : '🔴';
    const trafficText = cause.trafficLight === 'VERDE' 
      ? 'Balance Sólido / Protegido' 
      : cause.trafficLight === 'AMBAR' 
        ? 'En Vigilancia / Transición' 
        : 'Riesgo / Alerta';

    let msg = `📊 [ ${cause.ticker} ] · ${cause.name.toUpperCase()}\n`;
    msg += `🏷️ Cotización: ${activePrice} (${cause.change}) · ${cause.exchange}\n`;
    msg += `🚦 Estado: ${trafficEmoji} ${trafficText}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `🎯 PREVISIÓN DE FUTURO:\n`;
    msg += `• Corto Plazo (1-3 meses): ${cause.shortTermOutlook.arrow} ${cause.shortTermOutlook.label}\n  ↳ ${cause.shortTermOutlook.summary}\n\n`;
    msg += `• Medio Plazo (6-12 meses): ${cause.midTermOutlook.arrow} ${cause.midTermOutlook.label}\n  ↳ ${cause.midTermOutlook.summary}\n\n`;
    msg += `• Largo Plazo (1-3+ años): ${cause.longTermOutlook.arrow} ${cause.longTermOutlook.label}\n  ↳ ${cause.longTermOutlook.summary}\n\n`;

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🔍 CAUSA REAL DEL PRECIO:\n${cause.rootCause}\n\n`;
    msg += `🛡️ FILTRO DE RUIDO MEDIÁTICO:\n${cause.noiseExplanation}\n\n`;
    msg += `💰 SALUD FINANCIERA & CAJA:\n`;
    msg += `• Flujo de Caja: ${cause.cashFlowImpact}\n`;
    msg += `• Deuda & Solvencia: ${cause.debtSolvencyImpact}\n`;
    msg += `• EBITDA Operativo: ${cause.ebitdaImpact}\n\n`;
    msg += `⚖️ VEREDICTO EJECUTIVO:\n👉 ${cause.verdict}`;

    return msg;
  };

  // Dispatch directly via Telegram Bot API (each asset sent in a separate message)
  const sendTelegramDispatch = async (customText?: string) => {
    if (!customBotToken.trim()) {
      setTelegramStatusNotice('⚠️ Introduce tu Bot Token en los ajustes.');
      setIsTelegramSettingsOpen(true);
      return;
    }
    if (!customChatId.trim()) {
      setTelegramStatusNotice('⚠️ Introduce el Chat ID o @NombreCanal en los ajustes.');
      setIsTelegramSettingsOpen(true);
      return;
    }

    setIsSendingTelegram(true);
    try {
      localStorage.setItem('marketsense_tg_token', customBotToken.trim());
      localStorage.setItem('marketsense_tg_chatid', customChatId.trim());

      // If customText is provided (e.g. sending a single asset), dispatch only that
      if (customText) {
        const res = await fetch(`https://api.telegram.org/bot${customBotToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: customChatId.trim(),
            text: customText
          })
        });
        const data = await res.json();
        if (!data.ok) {
          throw new Error(data.description || 'Error al enviar a Telegram');
        }
        setTelegramStatusNotice(`✅ ¡Activo enviado con éxito a Telegram!`);
        setIsTelegramSettingsOpen(false);
        return;
      }

      // Otherwise, dispatch portfolio organized by separate messages:
      // 1. Header message
      // 2. Individual message for EACH tracked asset
      // 3. Macro events and calendar closing message
      const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      const tzLabel = clockMode === 'local' ? `Local ${userCity}` : clockMode === 'ny' ? 'Wall St (NY)' : 'Dublín';

      const headerMsg = `🏛️ MARKETSENSE · INFORME FUNDAMENTAL\n` +
        `📅 ${dateStr} · 🕒 ${clockTime} (${tzLabel})\n` +
        `📋 Despacho de ${trackedTickers.length} activos en seguimiento estratégico.\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `A continuación se remite la ficha contable y previsiones de cada activo por separado 👇`;

      const assetMessages = trackedTickers.map(ticker => buildAssetTelegramMessage(ticker));

      let closingMsg = `⚡ LO MÁS RELEVANTE EXPLICADO SIN RUIDO:\n\n`;
      DAILY_MACRO_IMPACT.slice(0, 2).forEach(item => {
        closingMsg += `📌 ${item.title}\n` +
          `  • En Cristiano: ${item.plainLanguage}\n` +
          `  • Afecta a: ${item.affectsTickers.join(', ')}\n\n`;
      });
      const ev = CRITICAL_EVENTS_CALENDAR[0];
      if (ev) {
        closingMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        closingMsg += `🔔 PRÓXIMO HITO DECISIVO:\n` +
          `• ${ev.date} (${ev.tickerOrSector}): ${ev.event} (Impacto: ${ev.balanceImpact})\n`;
      }

      const allMessages = [headerMsg, ...assetMessages, closingMsg];

      for (let i = 0; i < allMessages.length; i++) {
        const msgText = allMessages[i];
        const res = await fetch(`https://api.telegram.org/bot${customBotToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: customChatId.trim(),
            text: msgText
          })
        });
        const data = await res.json();
        if (!data.ok) {
          let errDesc = data.description || 'Revisa tu Token o permisos';
          if (errDesc.includes('chat not found')) {
            errDesc = `Chat no encontrado. En grupos privados ("${customChatId}") Telegram no acepta el nombre escrito; requiere su ID numérico (ej. -100...). Entra en ajustes ⚙️ y pulsa "Detectar ID de mi Grupo".`;
          } else if (errDesc.includes('bot is not a member') || errDesc.includes('not enough rights')) {
            errDesc = `Falta hacer Administrador a tu bot en ${customChatId} para que pueda publicar.`;
          }
          throw new Error(errDesc);
        }

        // Brief delay between sequential messages to respect rate limits and keep order
        if (i < allMessages.length - 1) {
          await new Promise(r => setTimeout(r, 400));
        }
      }

      setTelegramStatusNotice(
        `✅ ¡Enviados con éxito ${trackedTickers.length} informes separados a tu grupo!`
      );
      setIsTelegramSettingsOpen(false);
    } catch (err: any) {
      setTelegramStatusNotice(`❌ Telegram: ${err.message || 'Error de conexión'}`);
    } finally {
      setIsSendingTelegram(false);
    }
  };

  // Key Market Sessions & Fed Windows (in local/CET reference)
  interface MarketWindow {
    id: string;
    name: string;
    timeLabel: string;
    hourCET: number;
    minuteCET: number;
    description: string;
  }

  const MARKET_WINDOWS: MarketWindow[] = [
    { id: 'eu_open', name: 'Apertura Europa', timeLabel: '09:00 CET', hourCET: 9, minuteCET: 0, description: 'Campana BME Madrid & Europa + Datos preliminares' },
    { id: 'us_open', name: 'Apertura Wall St', timeLabel: '15:30 CET', hourCET: 15, minuteCET: 30, description: 'Campana NYSE/Nasdaq + Empleo/IPC de EE.UU.' },
    { id: 'fed_window', name: 'Ventana FED / Powell', timeLabel: '20:00 CET', hourCET: 20, minuteCET: 0, description: 'Ruedas de prensa de Powell, tipos de interés y minutas' },
    { id: 'daily_close', name: 'Cierre de Mercados', timeLabel: '22:00 CET', hourCET: 22, minuteCET: 0, description: 'Cierre de Wall Street y cómputo de variaciones contables' },
  ];

  // Calculate next key market window
  const currentMarketWindow = useMemo(() => {
    const now = new Date();
    const cetFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = cetFormatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    const totalMins = hour * 60 + minute;

    for (const win of MARKET_WINDOWS) {
      const winMins = win.hourCET * 60 + win.minuteCET;
      if (totalMins < winMins) {
        return win;
      }
    }
    return MARKET_WINDOWS[0];
  }, [clockTime]);

  // Automated Dispatch at Market Openings & Fed Windows
  useEffect(() => {
    if (!autoDispatchEnabled || !customBotToken || !customChatId) return;

    const checkScheduledDispatch = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const cetFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Madrid',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });
      const parts = cetFormatter.formatToParts(now);
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
      const totalMins = hour * 60 + minute;

      for (const win of MARKET_WINDOWS) {
        const winMins = win.hourCET * 60 + win.minuteCET;
        const windowKey = `${todayStr}_${win.id}`;

        // If we are within 30 minutes after the window trigger
        if (totalMins >= winMins && totalMins <= winMins + 30) {
          const stored = localStorage.getItem('marketsense_last_auto_window');
          if (stored !== windowKey) {
            localStorage.setItem('marketsense_last_auto_window', windowKey);
            setLastAutoDispatchWindow(windowKey);
            sendTelegramDispatch();
            setTelegramStatusNotice(
              `🔔 [Auto-Despacho] Informe de ${win.name} (${win.timeLabel}) enviado a ${chatDisplayName || 'Market_sense'}`
            );
            break;
          }
        }
      }
    };

    checkScheduledDispatch();
    const interval = setInterval(checkScheduledDispatch, 60000);
    return () => clearInterval(interval);
  }, [autoDispatchEnabled, customBotToken, customChatId, chatDisplayName]);

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#191C21] flex flex-col font-sans selection:bg-emerald-200">
      
      {/* ─── TOP EDITORIAL HEADER BAR (Warm Ivory Base) ─── */}
      <header className="border-b border-[#E7E2D8] bg-[#F8F6F0]/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo & Dublin Clock */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#191C21] text-[#FBF9F4] flex items-center justify-center font-bold font-mono text-sm shadow-sm">
                MS
              </div>
              <div>
                <span className="text-base font-bold text-[#191C21] tracking-tight flex items-center gap-1.5">
                  MarketSense
                  <span className="text-[11px] font-normal text-slate-500 font-serif italic">· Inteligencia Fundamental</span>
                </span>
              </div>
            </div>

            {/* Interactive Device / Market Clock */}
            <button
              onClick={toggleClockMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFECE4] hover:bg-[#E5E1D5] border border-[#DDD8CD] text-[11px] font-mono text-slate-700 transition cursor-pointer select-none"
              title="Toca para alternar entre tu hora local, Wall Street (NY) o Europa (Dublín/Madrid)"
            >
              <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>
                {clockMode === 'local' ? `Tu Hora (${userCity})` : clockMode === 'ny' ? 'Wall St (NY)' : 'Dublín / BME'}:
                <strong className="text-[#191C21] ml-1">{clockTime || '17:30'}</strong>
              </span>
              <span className="text-[10px] text-slate-400 ml-0.5" title="Cambiar zona">⇄</span>
            </button>

            {/* Next Market Bell Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#DDD8CD] text-[11px] text-slate-600">
              <span className={`w-2 h-2 rounded-full ${autoDispatchEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>Campana: <strong className="text-slate-900">{currentMarketWindow.name} ({currentMarketWindow.timeLabel})</strong></span>
              {autoDispatchEnabled && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">Auto</span>
              )}
            </div>
          </div>

          {/* Quick Actions: Direct Telegram Send, PWA Install & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => sendTelegramDispatch()}
              disabled={isSendingTelegram}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition active:scale-95 shadow-sm"
              title="Despachar informe a Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSendingTelegram 
                  ? 'Enviando...' 
                  : customChatId 
                    ? `Enviar a ${chatDisplayName || 'Market_sense'}` 
                    : 'Enviar a Telegram'}
              </span>
            </button>

            <button
              onClick={() => setIsTelegramSettingsOpen(true)}
              className="p-1.5 rounded-lg bg-[#EFECE4] hover:bg-[#E5E1D5] text-slate-600 hover:text-slate-900 border border-[#DDD8CD] transition"
              title="Configurar Bot y Canal de Telegram"
            >
              <Settings className="w-4 h-4" />
            </button>

            <PWAInstallButton />

            {/* User Profile / Google Auth Pill */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EFECE4] border border-[#DDD8CD] text-xs">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || ''} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">
                    {currentUser.displayName?.[0] || 'U'}
                  </div>
                )}
                <span className="font-semibold text-slate-800 hidden sm:inline max-w-[85px] truncate" title={currentUser.email || ''}>
                  {currentUser.displayName?.split(' ')[0] || 'Mi Cartera'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Sincronizado en la Nube"></span>
                <button
                  onClick={logout}
                  className="text-[10px] text-slate-400 hover:text-rose-700 ml-0.5 cursor-pointer"
                  title="Cerrar sesión"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-[#DDD8CD] text-xs font-semibold transition active:scale-95 shadow-2xs cursor-pointer"
                title="Inicia sesión con Google para sincronizar tu cartera personal en la nube"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.39 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
                </svg>
                <span className="hidden sm:inline">Tu Cuenta</span>
              </button>
            )}
          </div>

        </div>

        {/* Global Search Bar */}
        <div className="max-w-5xl mx-auto mt-2.5">
          <form onSubmit={handleSearchAudit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Auditar cualquier activo del mundo (ej. OHLA, VOO, BTC, TSM, SAN, REP, NVDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-24 py-1.5 rounded-lg bg-white border border-[#DDD8CD] text-xs text-[#191C21] placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs transition"
            />
            <button
              type="submit"
              className="absolute right-1 px-2.5 py-1 rounded bg-[#EFECE4] hover:bg-[#E5E1D5] text-[11px] font-semibold text-slate-700 transition"
            >
              Auditar
            </button>
          </form>
        </div>
      </header>

      {/* ─── STATUS NOTICE BANNER ─── */}
      {telegramStatusNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-900 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{telegramStatusNotice}</span>
          </div>
          <button onClick={() => setTelegramStatusNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── AUDITED POPUP BANNER (When searching a ticker) ─── */}
      {auditedResult && (
        <div className="max-w-5xl mx-auto w-full px-4 lg:px-8 mt-4">
          <div className="p-4 rounded-xl bg-white border border-emerald-300 shadow-md space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#191C21] font-mono">{auditedResult.ticker}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Auditoría Fundamental
                </span>
                <span className="text-xs font-mono font-semibold text-slate-600">{auditedResult.change}</span>
              </div>
              <div className="flex items-center gap-2">
                {!trackedTickers.includes(auditedResult.ticker) && (
                  <button
                    onClick={() => addAuditedTickerToWatchlist(auditedResult.ticker)}
                    className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
                  >
                    + Fijar en mi Cartera
                  </button>
                )}
                <button onClick={() => setAuditedResult(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick 3-Horizon Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {getOutlookBadge(auditedResult.shortTermOutlook)}
              {getOutlookBadge(auditedResult.midTermOutlook)}
              {getOutlookBadge(auditedResult.longTermOutlook)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8] space-y-1">
                <strong className="text-slate-800 font-semibold block">¿Por qué se mueve?</strong>
                <p className="text-slate-600 leading-relaxed">{auditedResult.rootCause}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8] space-y-1">
                <strong className="text-emerald-800 font-semibold block">Impacto en Caja & EBITDA</strong>
                <p className="text-slate-600 leading-relaxed">{auditedResult.ebitdaImpact}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3 CORE NAVIGATION TABS (Editorial Ivory Style) ─── */}
      <nav className="border-b border-[#E7E2D8] bg-[#F8F6F0] px-4 lg:px-8 mt-2">
        <div className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-4 overflow-x-auto py-2 text-xs font-medium">
          
          <button
            onClick={() => setActiveSection('watchlist')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'watchlist'
                ? 'bg-white text-emerald-800 font-bold border border-[#DDD8CD] shadow-xs'
                : 'text-slate-600 hover:text-[#191C21]'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-700" />
            <span>Mi Cartera & Previsiones (Lista)</span>
          </button>

          <button
            onClick={() => setActiveSection('impact')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'impact'
                ? 'bg-white text-emerald-800 font-bold border border-[#DDD8CD] shadow-xs'
                : 'text-slate-600 hover:text-[#191C21]'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Noticias Explicadas (En Cristiano)</span>
          </button>

          <button
            onClick={() => setActiveSection('events_opportunities')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'events_opportunities'
                ? 'bg-white text-emerald-800 font-bold border border-[#DDD8CD] shadow-xs'
                : 'text-slate-600 hover:text-[#191C21]'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-600" />
            <span>Eventos Clave & Oportunidades</span>
          </button>

        </div>
      </nav>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 lg:p-8 space-y-6">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: LISTA VERTICAL CON ACORDEÓN DESPLEGABLE Y PREVISIONES     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'watchlist' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E2D8] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#191C21] tracking-tight">
                    Tus Activos en Seguimiento Fundamental
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                    {trackedTickers.length} fijados
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentUser 
                    ? `👤 Watchlist personal de ${currentUser.displayName || currentUser.email} · 🟢 Sincronizada en la Nube`
                    : 'Watchlist personal guardada en este dispositivo. Toca cualquier activo para ver su causa y previsiones.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyText(executiveReportText)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAF8F5] text-slate-700 text-xs font-medium border border-[#DDD8CD] transition flex items-center gap-1 shadow-xs"
                  title="Copiar informe completo"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar Síntesis'}</span>
                </button>
              </div>
            </div>

            {/* Cloud Sync info banner if not logged in */}
            {!currentUser && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base shrink-0">☁️</span>
                  <span className="text-amber-900 leading-snug">
                    <strong>Cada usuario tiene su propia Watchlist privada.</strong> Ahora mismo está guardada en tu navegador. Si quieres sincronizarla automáticamente entre tu móvil, tablet y PC, conecta tu cuenta de Google.
                  </span>
                </div>
                <button
                  onClick={loginWithGoogle}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  Conectar con Google
                </button>
              </div>
            )}

            {/* Vertical Accordion List */}
            <div className="space-y-2.5">
              {trackedTickers.map(ticker => {
                const cause = WHY_IT_MOVES_DATA[ticker] || auditTickerFundamentals(ticker);
                const isExpanded = expandedTicker === ticker;

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

                      {/* Right: Price, Change & Chevron */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-sm text-[#191C21] font-mono block">
                            {customPrices[ticker] || cause.price}
                          </span>
                          <span className={`text-xs font-mono font-semibold ${
                            cause.isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {cause.change}
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
                                Cotización: <strong className="text-[#191C21] font-mono text-sm">{customPrices[ticker] || cause.price}</strong>
                                <span className={`ml-1 font-mono font-bold ${cause.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  ({cause.change})
                                </span>
                              </span>
                              <span>·</span>
                              <span className="px-2 py-0.5 rounded bg-[#EFECE4] text-slate-700 font-mono text-[11px]">
                                {cause.exchange} ({cause.tradingViewSymbol})
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* TradingView Direct Link */}
                            <a
                              href={`https://es.tradingview.com/chart/?symbol=${encodeURIComponent(cause.tradingViewSymbol)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition flex items-center gap-1"
                              title="Ver gráfico en tiempo real en TradingView"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>TradingView</span>
                            </a>

                            {/* Adjust Price Button */}
                            <button
                              onClick={() => {
                                setEditingPriceTicker(ticker);
                                setEditingPriceVal(customPrices[ticker] || cause.price);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-slate-100 text-slate-700 border border-[#DDD8CD] text-xs font-semibold transition"
                              title="Ajustar precio manualmente"
                            >
                              ✏️ Ajustar
                            </button>

                            {/* Send single asset to Telegram */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                sendTelegramDispatch(buildAssetTelegramMessage(ticker));
                              }}
                              disabled={isSendingTelegram}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition flex items-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50"
                              title={`Enviar solo el informe de ${cause.ticker} a Telegram`}
                            >
                              <Send className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Enviar a Telegram</span>
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
                                onClick={() => handleSaveCustomPrice(ticker)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition"
                              >
                                Guardar Precio
                              </button>
                              <button
                                onClick={() => setEditingPriceTicker(null)}
                                className="px-2 py-1.5 text-slate-500 hover:text-slate-800"
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
                            Previsión de Futuro (Corto, Medio y Largo Plazo)
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
                              <TrendingUp className="w-4 h-4" /> ¿Por qué se mueve hoy? (Causa Real)
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
                            Salud Contable Tangible (EBITDA, Caja & Deuda)
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
                              Veredicto Ejecutivo:
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
                              Consultor IA Fundamental: {cause.ticker}
                            </span>
                            <button
                              onClick={() => setOpenAIConsultantTicker(openAIConsultantTicker === ticker ? null : ticker)}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition"
                            >
                              {openAIConsultantTicker === ticker ? 'Ocultar Chat' : 'Abrir Chat con la IA'}
                            </button>
                          </div>

                          {openAIConsultantTicker === ticker && (
                            <TickerAIConsultant
                              cause={{
                                ...cause,
                                price: customPrices[ticker] || cause.price
                              }}
                            />
                          )}
                        </div>

                        {/* Actions for this item */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#EFECE4] text-xs">
                          <span className="text-slate-400 text-[11px]">
                            Ticker: {cause.ticker} · {cause.exchange}
                          </span>

                          <button
                            onClick={(e) => removeTickerFromWatchlist(e, ticker)}
                            className="text-slate-400 hover:text-rose-600 transition"
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
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: NOTICIAS EXPLICADAS PARA PERSONAS NO TÉCNICAS (EN CRISTIANO) */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'impact' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="border-b border-[#E7E2D8] pb-3">
              <h2 className="text-lg font-bold text-[#191C21] tracking-tight">
                Noticias e Impacto Relevante Explicado Sin Jerga
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Traducimos los comunicados y titulares a lo que realmente significa para tu dinero, eliminando el humo.
              </p>
            </div>

            <div className="space-y-3.5">
              {DAILY_MACRO_IMPACT.map(item => (
                <div key={item.id} className="p-5 rounded-2xl bg-white border border-[#E7E2D8] shadow-xs space-y-3.5">
                  
                  {/* Category & Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5F2EB] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#EFECE4] text-slate-700">
                        {item.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#191C21]">
                        {item.title}
                      </h3>
                    </div>

                    {getTrafficLightBadge(item.trafficLight)}
                  </div>

                  {/* "EN CRISTIANO" SPECIAL BOX */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <span>Explicado en Cristiano (¿Qué significa para tu dinero?):</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                      {item.plainLanguage}
                    </p>
                  </div>

                  {/* Contrast: What media screams vs What accounting says */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-1">
                      <span className="text-slate-500 font-semibold block">Ruido de la Prensa Sensacionalista:</span>
                      <p className="text-slate-700 leading-relaxed">{item.mediaNoise}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-1">
                      <span className="text-emerald-800 font-semibold block">Realidad Contable & Hechos:</span>
                      <p className="text-slate-700 leading-relaxed">{item.fundamentalReality}</p>
                    </div>
                  </div>

                  {/* Affected tickers in your portfolio */}
                  <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E7E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-semibold">Afecta principalmente a:</span>
                      <div className="flex items-center gap-1.5">
                        {item.affectsTickers.map(t => (
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
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 3: EVENTOS CRÍTICOS & OPORTUNIDADES GLOBALES                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'events_opportunities' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Critical Events Calendar */}
            <div className="space-y-3">
              <div className="border-b border-[#E7E2D8] pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#191C21] tracking-tight">
                    Alertas de Eventos Decisivos de Balance
                  </h2>
                  <p className="text-xs text-slate-500">
                    Fechas que alteran la caja, los bonos o las tasas.
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">Horario Dublín</span>
              </div>

              <div className="space-y-2.5">
                {CRITICAL_EVENTS_CALENDAR.map(ev => (
                  <div key={ev.id} className="p-4 rounded-xl bg-white border border-[#E7E2D8] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-[#EFECE4] text-slate-800">
                          {ev.date}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{ev.timeDublin}</span>
                        <span className="text-xs font-bold text-emerald-800 font-mono">{ev.tickerOrSector}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          ev.urgency === 'Crítico' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ev.urgency}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#191C21]">{ev.event}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{ev.whyMatters}</p>
                    </div>

                    <div className="md:text-right shrink-0 p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8] md:max-w-xs text-xs">
                      <span className="text-[11px] text-slate-500 font-semibold block">Impacto en Balance:</span>
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
                  Sentimiento vs. Realidad Contable en Bolsas Globales
                </h3>
                <p className="text-xs text-slate-500">
                  Lectura del pánico o complacencia en las 4 grandes plazas del mundo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {GLOBAL_MARKET_PULSE.map((pulse, idx) => (
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

                    <div className="pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">{pulse.valuationMetric}</span>
                      <span className="text-emerald-800 font-semibold">{pulse.strategicGuidance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unique Fundamental Opportunities */}
            <div className="space-y-3 pt-4 border-t border-[#E7E2D8]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#191C21] tracking-tight">
                    Oportunidades Únicas por Castigo Irracional
                  </h3>
                  <p className="text-xs text-slate-500">
                    Activos castigados por el ruido pero con balances de acero.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                  {['Todos', 'Bolsa Europea & España', 'Bolsa USA', 'Asia & Emergentes', 'Cripto & Web3'].map(sector => (
                    <button
                      key={sector}
                      onClick={() => setOppSectorFilter(sector)}
                      className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                        oppSectorFilter === sector
                          ? 'bg-emerald-700 text-white font-semibold'
                          : 'bg-white text-slate-600 hover:text-[#191C21] border border-[#DDD8CD]'
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {OPPORTUNITIES_DATABASE
                  .filter(o => oppSectorFilter === 'Todos' || o.marketSector === oppSectorFilter)
                  .map(opp => (
                    <div key={opp.ticker} className="p-4 rounded-xl bg-white border border-[#E7E2D8] space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm font-mono text-[#191C21]">{opp.ticker}</span>
                          <span className="text-xs text-slate-500">{opp.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFECE4] text-slate-700 font-mono">
                            {opp.currentPrice}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-700">
                          {opp.potentialUpside}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {opp.whyIsOpportunity}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] p-2 rounded-lg bg-[#FAF8F5] border border-[#E7E2D8]">
                        <div>
                          <span className="text-slate-500 block">EBITDA:</span>
                          <span className="text-slate-800 font-medium">{opp.ebitdaStrength}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Deuda:</span>
                          <span className="text-slate-800 font-medium">{opp.debtProfile}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">
                          Riesgo/Beneficio: <strong className="text-[#191C21]">{opp.riskRewardRatio}</strong>
                        </span>

                        <button
                          onClick={() => addAuditedTickerToWatchlist(opp.ticker)}
                          disabled={trackedTickers.includes(opp.ticker)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            trackedTickers.includes(opp.ticker)
                              ? 'bg-[#EFECE4] text-slate-500'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          {trackedTickers.includes(opp.ticker) ? 'En tu Cartera' : '+ Fijar Activo'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ─── TELEGRAM SETTINGS MODAL ─── */}
      {isTelegramSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDD8CD] w-full max-w-lg rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-[#191C21]">
                  Despacho Directo a Telegram (Bot Oficial)
                </h3>
              </div>
              <button onClick={() => setIsTelegramSettingsOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Configura tu Bot de Telegram para que MarketSense envíe tus informes y alertas al canal de tus colegas o a tu chat privado con 1 solo clic en segundo plano.
            </p>

            {/* Quick Guide Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowBotGuide(!showBotGuide)}
                className="text-xs text-emerald-700 hover:text-emerald-800 underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showBotGuide ? 'Ocultar Guía' : '¿Cómo se crea el Bot y el Canal? (Guía 2 min)'}</span>
              </button>

              {showBotGuide && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD8CD] text-xs text-slate-700 space-y-2">
                  <strong className="text-slate-900 block">Paso a Paso Rápido (100% Gratis):</strong>
                  <p>1. En Telegram busca a <code>@BotFather</code> y escribe <code>/newbot</code>.</p>
                  <p>2. Asígnale nombre y usuario. BotFather te responderá con tu <strong>Bot Token</strong> (algo como <code>7123456789:AAHk...</code>).</p>
                  <p>3. <strong>Para enviar a un Canal o Grupo con amigos:</strong> Crea el canal, añade tu bot como <strong>Administrador</strong> (para que tenga permiso de publicar) y escribe en Chat ID el <code>@nombre_de_tu_canal</code>.</p>
                  <p>4. <strong>Para enviarte solo a ti:</strong> Inicia chat con tu bot y escribe tu ID de usuario de Telegram.</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">
                  Nombre visible en el botón de la app
                </label>
                <input
                  type="text"
                  placeholder="ej. Market_sense"
                  value={chatDisplayName}
                  onChange={(e) => {
                    setChatDisplayName(e.target.value);
                    localStorage.setItem('marketsense_tg_display_name', e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD8CD] text-[#191C21] text-xs focus:outline-none focus:border-emerald-700"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Así se mostrará el botón principal: <strong>"Enviar a {chatDisplayName || 'Market_sense'}"</strong>.
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">
                  Bot Token (de @BotFather)
                </label>
                <input
                  type="text"
                  placeholder="ej. 7123456789:AAHkL9Z..."
                  value={customBotToken}
                  onChange={(e) => setCustomBotToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD8CD] text-[#191C21] font-mono text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-700 font-semibold block">
                    Chat ID Técnico de Telegram
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Grupos: requiere ID numérico
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="ej. -1004499299168"
                  value={customChatId}
                  onChange={(e) => setCustomChatId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD8CD] text-[#191C21] font-mono text-xs focus:outline-none focus:border-emerald-700"
                />

                {/* Auto-detect button for groups */}
                <div className="mt-2 p-2.5 rounded-xl bg-[#F5F2EB] border border-[#DDD8CD] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-800">
                      ¿Tienes un Grupo como "Market_sense"?
                    </span>
                    <button
                      type="button"
                      onClick={detectChatIdAutomatically}
                      disabled={isDetectingChatId}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isDetectingChatId ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Buscando...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3 h-3" />
                          <span>🔍 Detectar ID de mi Grupo</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Telegram no permite usar el título del grupo ("Market_sense") para enviar mensajes por bot; requiere su <strong>Chat ID numérico</strong> (que empieza por un guion negativo, ej. <code>-100...</code>).
                    <br />
                    👉 <em>Escribe una palabra en tu grupo (ej. "hola") y luego toca el botón verde para que se rellene solo.</em>
                  </p>
                  {detectStatus && (
                    <div className="text-[11px] p-2 rounded-lg bg-white border border-[#DDD8CD] leading-snug">
                      {detectStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* Automated Market Windows Dispatch Toggle */}
              <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#DDD8CD] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-800" />
                    <span className="text-xs font-bold text-slate-900">
                      Auto-Despacho en Horarios de Mercado & FED
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = !autoDispatchEnabled;
                      setAutoDispatchEnabled(newVal);
                      localStorage.setItem('marketsense_tg_auto_dispatch', String(newVal));
                    }}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                      autoDispatchEnabled
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {autoDispatchEnabled ? 'Activado' : 'Pausado'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Cuando la app está abierta durante las campanas bursátiles o noticias decisivas, despacha sola el informe a <strong>{chatDisplayName || 'Market_sense'}</strong>:
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 rounded-lg bg-white border border-[#E7E2D8] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">🇪🇺 Apertura Europa</span>
                      <span className="font-mono text-emerald-800 font-bold">09:00 CET</span>
                    </div>
                    <span className="text-slate-500 block text-[9px]">Campana Madrid BME & Londres</span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-[#E7E2D8] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">🇺🇸 Apertura Wall St</span>
                      <span className="font-mono text-emerald-800 font-bold">15:30 CET</span>
                    </div>
                    <span className="text-slate-500 block text-[9px]">NYSE/Nasdaq + IPC/Empleo USA</span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-[#E7E2D8] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">🏛️ Ventana FED / BCE</span>
                      <span className="font-mono text-emerald-800 font-bold">20:00 CET</span>
                    </div>
                    <span className="text-slate-500 block text-[9px]">Powell, Tipos de interés y FOMC</span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-[#E7E2D8] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">🔔 Cierre & Balance</span>
                      <span className="font-mono text-emerald-800 font-bold">22:00 CET</span>
                    </div>
                    <span className="text-slate-500 block text-[9px]">Cierre diario y consolidación contable</span>
                  </div>
                </div>
              </div>

              {/* 24/7 Autonomous Cloud Cron (GitHub Actions) */}
              <div className="p-3 rounded-xl bg-slate-900 text-white space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold text-white">
                      🤖 Cron Autónomo 24/7 en la Nube (GitHub)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                    Móvil apagado OK
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Para que se envíe solo <strong>mientras estás trabajando o durmiendo</strong>, ya tienes programado el Cron en tu repositorio de GitHub (09:00, 15:30, 20:00 y 22:00 CET de Lunes a Viernes).
                </p>

                <button
                  type="button"
                  onClick={() => setShowCronGuide(!showCronGuide)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{showCronGuide ? 'Ocultar guía de activación' : '¿Cómo activarlo en GitHub en 1 minuto?'}</span>
                </button>

                {showCronGuide && (
                  <div className="p-2.5 rounded-lg bg-slate-800 text-slate-200 text-[11px] space-y-2 border border-slate-700">
                    <p className="font-semibold text-white">Solo necesitas añadir tu Bot Token en GitHub:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[10.5px]">
                      <li>Abre tu repositorio en <strong>GitHub</strong> en el navegador.</li>
                      <li>Toca en <strong>Settings</strong> ➔ <strong>Secrets and variables</strong> ➔ <strong>Actions</strong>.</li>
                      <li>Pulsa el botón verde <strong>New repository secret</strong>.</li>
                      <li>Nombre: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300 font-mono">TELEGRAM_BOT_TOKEN</code></li>
                      <li>Valor: Pega tu Bot Token de @BotFather (ej. <code className="text-slate-400">{customBotToken ? customBotToken.slice(0, 15) + '...' : '7123456...'}</code>).</li>
                      <li>¡Listo! Tu Chat ID (<code className="text-emerald-300">-1004499299168</code>) ya quedó preconfigurado por defecto en el código.</li>
                    </ol>
                    <p className="text-slate-400 italic text-[10px]">
                      A partir de ese momento, los servidores de GitHub despacharán automáticamente los mensajes por separado a las 4 horas de mercado aunque no toques la app.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => sendTelegramDispatch()}
                disabled={isSendingTelegram}
                className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isSendingTelegram ? 'Enviando a Telegram...' : 'Guardar y Enviar Prueba'}</span>
              </button>

              <button
                onClick={() => setIsTelegramSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#EFECE4] hover:bg-[#E5E1D5] text-slate-700 text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── STREAMLINED FOOTER ─── */}
      <footer className="border-t border-[#E7E2D8] bg-[#F8F6F0] py-4 px-4 text-center text-xs text-slate-500">
        <p>MarketSense · Terminal Fundamental & Previsiones · Dublín & Bolsas Globales</p>
      </footer>

    </div>
  );
}

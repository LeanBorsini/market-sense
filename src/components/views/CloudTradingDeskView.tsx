import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cloud, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Pause, 
  RefreshCw, 
  BookOpen, 
  Zap, 
  Sliders, 
  Cpu, 
  Calculator, 
  History, 
  Sparkles, 
  Clock, 
  Lock, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Layers, 
  Radio, 
  ArrowRight, 
  Crosshair, 
  Save,
  Check,
  Award,
  Flame,
  Info,
  ShieldAlert,
  AlertOctagon,
  Activity,
  Skull,
  Gauge,
  ZapOff,
  LockKeyhole
} from 'lucide-react';
import { DetailedTrade, CloudBotState, EvolutionaryAdjustment, SizingCalculationResult } from '../../types/cloudBot';

export const CloudTradingDeskView: React.FC = () => {
  // ─── 1. CORE CLOUD BOT STATE ───
  const [botState, setBotState] = useState<CloudBotState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // ─── 2. ACTIVE WORKSPACE TAB ───
  // 'equity_sentinel' | 'journal' | 'evolution' | 'calculator' | 'active_orders' | 'broker_prop'
  const [activeTab, setActiveTab] = useState<'equity_sentinel' | 'journal' | 'evolution' | 'calculator' | 'active_orders' | 'broker_prop'>('equity_sentinel');

  // ─── 2.1 SENTINEL & CIRCUIT BREAKER CONTROLS ───
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);
  const [isResettingBreaker, setIsResettingBreaker] = useState<boolean>(false);
  const [customDailyLimit, setCustomDailyLimit] = useState<number>(4.0);
  const [customBreakerLimit, setCustomBreakerLimit] = useState<number>(3.2);
  const [customCalcMode, setCustomCalcMode] = useState<'BALANCE_BASED' | 'TRAILING_EQUITY'>('BALANCE_BASED');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // ─── 3. JOURNAL FILTERS & EXPANSION ───
  const [journalFilter, setJournalFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'WICK_HUNT'>('ALL');
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>('trd-1');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);

  // ─── 4. SIZING CALCULATOR STATE ───
  const [calcSymbol, setCalcSymbol] = useState<string>('S&P 500 (VOO/ES)');
  const [calcRiskPct, setCalcRiskPct] = useState<number>(1.0);
  const [calcBalance, setCalcBalance] = useState<number>(10000);
  const [calcResult, setCalcResult] = useState<SizingCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // ─── 5. EVOLUTION MATRIX CUSTOMIZATION ───
  const [customCushions, setCustomCushions] = useState<Record<string, number>>({});
  const [isUpdatingCushion, setIsUpdatingCushion] = useState<boolean>(false);

  // Fetch live state from backend
  const fetchBotState = async () => {
    try {
      const res = await fetch('/api/cloud-bot/state');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setBotState(json.data);
          setCustomCushions(json.data.cushionsBySymbol || {});
          if (json.data.dailyDrawdownLimitPct) setCustomDailyLimit(json.data.dailyDrawdownLimitPct);
          if (json.data.circuitBreakerThresholdPct) setCustomBreakerLimit(json.data.circuitBreakerThresholdPct);
          if (json.data.calculationMode) setCustomCalcMode(json.data.calculationMode);
        }
      }
    } catch (err) {
      console.error('Error fetching cloud bot state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run Flash-Crash Stress Test / Circuit Breaker Test
  const handleStressTest = async () => {
    setIsStressTesting(true);
    try {
      const res = await fetch('/api/cloud-bot/circuit-breaker/stress-test', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setBotState(json.state);
        setStatusMessage('⚡ SIMULACRO EJECUTADO: El Circuit Breaker liquidó al 3.3% y SALVÓ la cuenta de tocar el 4.0% fatal.');
        setTimeout(() => setStatusMessage(null), 6000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStressTesting(false);
    }
  };

  // Reset / Unlock Circuit Breaker (Simulate broker daily rollover at 00:00)
  const handleResetBreaker = async () => {
    setIsResettingBreaker(true);
    try {
      const res = await fetch('/api/cloud-bot/circuit-breaker/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setBotState(json.state);
        setStatusMessage('🔄 Circuit Breaker desbloqueado. Nueva sesión iniciada. Operativa lista.');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResettingBreaker(false);
    }
  };

  // Save Prop Firm Settings
  const handleSavePropSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/cloud-bot/prop-firm/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyDrawdownLimitPct: customDailyLimit,
          circuitBreakerThresholdPct: customBreakerLimit,
          calculationMode: customCalcMode
        })
      });
      if (res.ok) {
        const json = await res.json();
        setBotState(json.state);
        setStatusMessage('✅ Parámetros del Guardián de Fondeo actualizados correctamente');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchBotState();
    const interval = setInterval(fetchBotState, 6000); // Poll every 6s for real-time cloud sync
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic sizing whenever inputs change
  useEffect(() => {
    const runCalculation = async () => {
      setIsCalculating(true);
      try {
        const res = await fetch('/api/cloud-bot/calculate-sizing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: calcSymbol,
            balance: calcBalance,
            riskPercent: calcRiskPct
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setCalcResult(json.result);
          }
        }
      } catch (err) {
        console.error('Calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    runCalculation();
  }, [calcSymbol, calcRiskPct, calcBalance, botState?.cushionsBySymbol]);

  // Toggle Bot ON/OFF
  const handleToggleBot = async () => {
    setIsToggling(true);
    try {
      const res = await fetch('/api/cloud-bot/toggle', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setStatusMessage(json.message);
        await fetchBotState();
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  // Dispatch trade with calculated params
  const handleExecuteOrder = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/cloud-bot/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: calcSymbol,
          direction: 'BUY',
          strategyName: `${calcSymbol} - Entrada Algorítmica con Holgura Adaptativa`,
          riskPercent: calcRiskPct
        })
      });
      if (res.ok) {
        const json = await res.json();
        setStatusMessage(`✅ Orden despachada a la nube: ${json.trade.ticket} (${json.trade.lotSize} lotes)`);
        await fetchBotState();
        setActiveTab('active_orders');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Save Operator Note in Journal
  const handleSaveNote = async (tradeId: string) => {
    setIsSavingNote(true);
    try {
      const res = await fetch('/api/cloud-bot/journal/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId, note: editingNoteText })
      });
      if (res.ok) {
        await fetchBotState();
        setEditingNotesId(null);
        setStatusMessage('Observación guardada en el libro de operaciones');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Update Anti-Hunt Cushion
  const handleSaveCushion = async (symbol: string, pips: number) => {
    setIsUpdatingCushion(true);
    try {
      const res = await fetch('/api/cloud-bot/cushion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, cushionPips: pips })
      });
      if (res.ok) {
        await fetchBotState();
        setStatusMessage(`Colchón adaptativo actualizado a +${pips} pips para ${symbol}`);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingCushion(false);
    }
  };

  // Filtered closed trades
  const filteredTrades = useMemo(() => {
    if (!botState) return [];
    return botState.closedTrades.filter(t => {
      if (journalFilter === 'WIN') return t.status === 'CLOSED_TP';
      if (journalFilter === 'LOSS') return t.status === 'CLOSED_SL';
      if (journalFilter === 'WICK_HUNT') return t.postMortem?.wasWickHunt === true;
      return true;
    });
  }, [botState, journalFilter]);

  if (isLoading && !botState) {
    return (
      <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Conectando con el Motor Autónomo en la Nube 24/7...</p>
      </div>
    );
  }

  const isRunning = botState?.isRunning ?? true;
  const balance = botState?.accountBalance ?? 10000;
  const initialCap = botState?.initialCapital ?? 10000;
  const currentEquity = botState?.currentEquity ?? balance;
  const floatingPnl = botState?.floatingPnlEur ?? 0;
  const floatingPnlPct = botState?.floatingPnlPct ?? 0;
  const totalProfit = balance - initialCap;
  const winRate = botState?.winRatePct ?? 66.7;
  const dailyPnl = botState?.dailyPnlEur ?? 185.50;
  const dailyDrawdownLimit = botState?.dailyDrawdownLimitPct ?? 4.0;
  const circuitBreakerThreshold = botState?.circuitBreakerThresholdPct ?? 3.2;
  const circuitBreakerTripped = botState?.circuitBreakerTripped ?? false;
  const emergencyCount = botState?.emergencyLiquidationsCount ?? 1;
  const committedRisk = botState?.totalCommittedRiskPct ?? 0;
  const huntsAvoided = botState?.wickHuntsAvoided ?? 5;
  const huntsDetected = botState?.wickHuntsDetected ?? 2;

  // Real-time Floating Drawdown from day's benchmark capital
  const benchmarkCapital = botState?.calculationMode === 'TRAILING_EQUITY'
    ? (botState?.peakEquityToday ?? initialCap)
    : initialCap;
  const floatingLossEur = benchmarkCapital - currentEquity;
  const currentFloatingDrawdownPct = floatingLossEur > 0 ? Number(((floatingLossEur / benchmarkCapital) * 100).toFixed(2)) : 0;
  const distanceToCircuitBreaker = Math.max(0, Number((circuitBreakerThreshold - currentFloatingDrawdownPct).toFixed(2)));
  const distanceToFatalBreach = Math.max(0, Number((dailyDrawdownLimit - currentFloatingDrawdownPct).toFixed(2)));

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP CLOUD STATUS & OPERATOR BANNER ─── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-md border border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-3 rounded-xl border ${isRunning ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'}`}>
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base sm:text-lg tracking-tight">Centro de Mando del Bot en la Nube</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                  isRunning 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                }`}>
                  <Radio className={`w-3 h-3 ${isRunning ? 'text-emerald-400 animate-ping' : 'text-rose-400'}`} />
                  {isRunning ? 'NUBE ACTIVA 24/7' : 'EN PAUSA'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Sin gastar luz en PC · 100% Autónomo
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Operativa desasistida en la nube con motor evolutivo anti-caza y Guardián de Floating Equity para cuentas de fondeo.
              </p>
            </div>
          </div>

          {/* Quick Bot Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleBot}
              disabled={isToggling}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pausar Nube' : 'Reanudar Nube'}
            </button>
            <button
              type="button"
              onClick={fetchBotState}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Refrescar estado en vivo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 🚨 CRITICAL CIRCUIT BREAKER TRIPPED ALERT BANNER */}
        {circuitBreakerTripped && (
          <div className="p-4 rounded-xl bg-rose-950/95 border-2 border-rose-500 text-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-7 h-7 text-rose-400 shrink-0 animate-pulse" />
              <div>
                <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-2 flex-wrap">
                  <span>CIRCUIT BREAKER DE EMERGENCIA DISPARADO — CUENTA SALVADA</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/30 text-rose-200 border border-rose-400/50">PROTECCIÓN ACTIVA</span>
                </span>
                <p className="text-[11px] text-rose-200 mt-0.5">
                  {botState?.circuitBreakerReason || `Pérdida flotante alcanzó el umbral crítico del ${circuitBreakerThreshold}%. La IA liquidó todas las operaciones al instante para que la cuenta NUNCA tocara el ${dailyDrawdownLimit}% fatal.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetBreaker}
              disabled={isResettingBreaker}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-rose-950 text-xs font-bold cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResettingBreaker ? 'animate-spin' : ''}`} />
              <span>Simular Rollover 00:00 (Desbloquear)</span>
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ─── KEY TELEMETRY CARDS (UPGRADED WITH LIVE FLOATING EQUITY) ─── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-700/60">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Capital Cerrado</span>
            <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
              €{balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalProfit >= 0 ? '+' : ''}€{totalProfit.toFixed(2)} ({((totalProfit / initialCap) * 100).toFixed(2)}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Equity Flotante (En Vivo)</span>
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono mt-0.5 text-white">
              €{currentEquity.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <span className={`text-[10px] font-semibold flex items-center gap-1 ${floatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{floatingPnl >= 0 ? '+' : ''}{floatingPnl.toFixed(2)} €</span>
              <span>({floatingPnlPct >= 0 ? '+' : ''}{floatingPnlPct.toFixed(2)}%)</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tasa de Acierto</span>
            <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5 flex items-center gap-1.5">
              <span>{winRate}%</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] text-slate-400">
              {botState?.winningTrades ?? 8} ganadas / {botState?.losingTrades ?? 4} perdidas
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${
            circuitBreakerTripped 
              ? 'bg-rose-950/60 border-rose-500/80' 
              : currentFloatingDrawdownPct > 2.0 
                ? 'bg-amber-950/60 border-amber-500/80' 
                : 'bg-slate-800/80 border-slate-700'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Drawdown Flotante</span>
            <div className={`text-base sm:text-lg font-bold font-mono mt-0.5 ${
              circuitBreakerTripped ? 'text-rose-400' : currentFloatingDrawdownPct > 2.0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {currentFloatingDrawdownPct > 0 ? `-${currentFloatingDrawdownPct}%` : '0.0%'}
            </div>
            <span className="text-[10px] text-slate-300 block">
              {circuitBreakerTripped 
                ? 'Freno Activado' 
                : `A ${distanceToCircuitBreaker}% del Circuit Breaker`}
            </span>
          </div>

          <div className="col-span-2 md:col-span-1 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Blindaje de Fondeo</span>
            <div className="text-base sm:text-lg font-bold text-amber-200 font-mono mt-0.5 flex items-center gap-1.5">
              <span>{emergencyCount} salvadas</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] text-amber-300 font-semibold">
              +{huntsAvoided} mechazos absorbidos
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. WORKSPACE NAVIGATION TABS ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('equity_sentinel')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'equity_sentinel'
              ? 'bg-rose-950 text-white shadow-sm border border-rose-500/60'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <ShieldAlert className={`w-4 h-4 ${circuitBreakerTripped ? 'text-rose-400 animate-pulse' : 'text-emerald-500'}`} />
          <span>Guardián de Floating Equity (Anti-Breach)</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
            circuitBreakerTripped
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-950 text-emerald-300'
          }`}>
            {circuitBreakerTripped ? 'BLOQUEO ACTIVO' : 'ESCUDO ACTIVO'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('journal')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'journal'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Libro Detallado de Trades (Journal)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-amber-200">
            {botState?.closedTrades.length ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>Calculadora Dinámica de Riesgo (% y Pips)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evolution')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'evolution'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Shield className="w-4 h-4 text-blue-400" />
          <span>Motor Evolutivo Anti-Manipulación (Fondeo)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-950 text-blue-300">
            +{huntsAvoided} salvados
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active_orders')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'active_orders'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Crosshair className="w-4 h-4 text-purple-400" />
          <span>Órdenes Activas en Vivo</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-950 text-purple-300">
            {botState?.activeOrders.length ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('broker_prop')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'broker_prop'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-slate-400" />
          <span>Ajustes de Fondeo & Reglas</span>
        </button>
      </div>

      {/* ─── TAB 0: GUARDIÁN DE FLOATING EQUITY (ANTI-BREACH 24/7) ─── */}
      {activeTab === 'equity_sentinel' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Main Sentinel Hero Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span>Guardián de Floating Equity & Supervivencia de Fondeo</span>
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                    circuitBreakerTripped
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    <Activity className={`w-3 h-3 ${circuitBreakerTripped ? 'text-rose-600' : 'text-emerald-600 animate-pulse'}`} />
                    {circuitBreakerTripped ? 'CIRCUIT BREAKER DISPARADO (BLOQUEO)' : 'ESCUDO ACTIVO 24/7'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Monitoreo continuo de pérdidas no realizadas (flotantes). Si el mercado se desploma antes de cerrar las órdenes, la IA liquida preventivamente para que nunca toques el límite fatal del broker.
                </p>
              </div>

              {/* Stress Test & Reset Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleStressTest}
                  disabled={isStressTesting || circuitBreakerTripped}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                  title="Simula un desplome repentino para ver actuar al Circuit Breaker"
                >
                  <Zap className={`w-3.5 h-3.5 text-amber-300 ${isStressTesting ? 'animate-spin' : ''}`} />
                  <span>{isStressTesting ? 'Simulando...' : 'Simular Flash Crash'}</span>
                </button>

                {circuitBreakerTripped && (
                  <button
                    type="button"
                    onClick={handleResetBreaker}
                    disabled={isResettingBreaker}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResettingBreaker ? 'animate-spin' : ''}`} />
                    <span>Desbloquear Sesión</span>
                  </button>
                )}
              </div>
            </div>

            {/* ─── BARÓMETRO DE SUPERVIVENCIA VISUAL EN VIVO ─── */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-bold flex items-center gap-2 text-slate-200">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  Barómetro en Tiempo Real: Drawdown Flotante vs Límite Fatal de la Prop Firm
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  Modo: {botState?.calculationMode === 'TRAILING_EQUITY' ? 'Trailing High-Water Mark (Apex)' : 'Balance Diario (FTMO/FundedNext)'}
                </span>
              </div>

              {/* Progress Bar Visualization */}
              <div className="space-y-1.5">
                <div className="h-5 w-full bg-slate-800 rounded-lg p-0.5 flex overflow-hidden border border-slate-700 relative">
                  {/* Zone 1: Safe 0 - 2% (50% width) */}
                  <div className="h-full bg-emerald-500/70 rounded-l flex items-center justify-center text-[9px] font-bold text-white px-1" style={{ width: '50%' }}>
                    Seguro (0% - 2.0%)
                  </div>
                  {/* Zone 2: Warning 2 - 2.8% (20% width) */}
                  <div className="h-full bg-amber-500/80 flex items-center justify-center text-[9px] font-bold text-slate-950 px-1" style={{ width: '20%' }}>
                    Freeze (2.0% - 2.8%)
                  </div>
                  {/* Zone 3: Circuit Breaker 2.8 - 3.2% (10% width) */}
                  <div className="h-full bg-rose-600 flex items-center justify-center text-[9px] font-bold text-white px-1" style={{ width: '10%' }}>
                    Circuit Breaker ({circuitBreakerThreshold}%)
                  </div>
                  {/* Zone 4: Death Zone 3.2 - 4.0% (20% width) */}
                  <div className="h-full bg-rose-950 flex items-center justify-center text-[9px] font-bold text-rose-300 px-1" style={{ width: '20%' }}>
                    ☠️ Brecha ({dailyDrawdownLimit}%)
                  </div>

                  {/* Marker indicator */}
                  <div 
                    className="absolute top-0 bottom-0 w-1.5 bg-white shadow-lg shadow-white z-10 transition-all duration-300"
                    style={{ left: `${Math.min(99, Math.max(1, (currentFloatingDrawdownPct / dailyDrawdownLimit) * 100))}%` }}
                    title={`Drawdown Flotante Actual: ${currentFloatingDrawdownPct}%`}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
                  <span>0.0% (Inicio Día)</span>
                  <span className="text-amber-400">2.0% Alerta</span>
                  <span className="text-rose-400 font-bold">{circuitBreakerThreshold}% Salto IA (Panic Close)</span>
                  <span className="text-rose-500 font-bold">{dailyDrawdownLimit}% Pérdida de Cuenta (Prop Firm)</span>
                </div>
              </div>

              {/* Status readout chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Balance vs Equity</span>
                  <div className="font-mono font-bold text-white text-xs mt-0.5">
                    €{balance.toFixed(2)} ➔ <span className={floatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>€{currentEquity.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Pérdida Flotante Actual</span>
                  <div className={`font-mono font-bold text-xs mt-0.5 ${currentFloatingDrawdownPct > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {currentFloatingDrawdownPct > 0 ? `-${currentFloatingDrawdownPct}% (-${floatingLossEur.toFixed(2)} €)` : '0.00% (Sin riesgo)'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Margen hasta Circuit Breaker</span>
                  <div className="font-mono font-bold text-amber-300 text-xs mt-0.5">
                    {distanceToCircuitBreaker}% ({((benchmarkCapital * distanceToCircuitBreaker) / 100).toFixed(2)} €)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Distancia a Muerte de Cuenta</span>
                  <div className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
                    +{distanceToFatalBreach}% ({((benchmarkCapital * distanceToFatalBreach) / 100).toFixed(2)} €)
                  </div>
                </div>
              </div>
            </div>

            {/* ─── DETAILED EXPLANATION: HOW THE AI PREVENTS THE ACCOUNT LOSS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Nivel 1: Alerta Amarilla (2.0%)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Si las pérdidas flotantes sumadas de todas las órdenes abiertas tocan el 2.0%, el bot <strong>congela inmediatamente la apertura de nuevas posiciones</strong> y traslada a Break-Even cualquier orden en positivo.
                </p>
                <div className="text-[10px] font-mono text-amber-700 bg-white/80 p-1.5 rounded border border-amber-200">
                  Acción: Bloqueo de nuevas órdenes + Freeze
                </div>
              </div>

              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-2">
                <div className="flex items-center gap-2 text-orange-900 font-bold text-xs">
                  <Sliders className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Nivel 2: Desapalancamiento (2.8%)</span>
                </div>
                <p className="text-[11px] text-orange-800 leading-relaxed">
                  Si el retroceso persiste hacia el 2.8%, la IA ejecuta un <strong>cierre parcial defensivo del 50%</strong> de la orden con mayor flotante adverso. Esto inyecta margen libre y frena la velocidad de drawdown.
                </p>
                <div className="text-[10px] font-mono text-orange-700 bg-white/80 p-1.5 rounded border border-orange-200">
                  Acción: Cierre parcial 50% lotaje preventivo
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Nivel 3: Circuit Breaker ({circuitBreakerThreshold}%)</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Si ocurre un flash crash o mechazo de noticias y se llega al {circuitBreakerThreshold}%, la IA ejecuta un <strong>Panic Close simultáneo a mercado de TODAS las posiciones</strong>. La cuenta pierde el {circuitBreakerThreshold}%, pero <strong>NUNCA TOCA EL {dailyDrawdownLimit}% FATAL</strong>.
                </p>
                <div className="text-[10px] font-mono text-rose-700 bg-white/80 p-1.5 rounded border border-rose-200">
                  Resultado: ¡Cuenta salvada y contrato intacto!
                </div>
              </div>
            </div>

            {/* ─── PRE-TRADE CONCURRENT RISK CHECK EXPLANATION ─── */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <LockKeyhole className="w-4 h-4 text-slate-600" />
                <span>Prevención de Sobreexposición Concurrente (Pre-Trade Sentinel)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                El bot calcula en cada milisegundo la suma del riesgo nominal de todas las órdenes activas: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">Σ(Riesgo Órdenes Abiertas) = {committedRisk}%</code>.
                Si intentas abrir una orden adicional cuyo riesgo sumado supere el colchón de seguridad (<span className="font-mono font-bold text-slate-800">{(circuitBreakerThreshold - 0.5).toFixed(1)}%</span>), el sistema <strong>rechaza la orden en el origen</strong> para que sea matemáticamente imposible que un movimiento repentino en contra queme tu cuenta.
              </p>
            </div>

            {/* ─── PROP FIRM RULE CONFIGURATION ─── */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-800 block">Personalizar Parámetros de tu Empresa de Fondeo</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">Límite Diario Oficial de la Firma</label>
                  <select
                    value={customDailyLimit}
                    onChange={(e) => setCustomDailyLimit(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold"
                  >
                    <option value={4.0}>4.0% (FundedNext / FTMO Estándar)</option>
                    <option value={5.0}>5.0% (FTMO Clásico / Alpha Capital)</option>
                    <option value={3.0}>3.0% (Firmas Ultra-Conservadoras)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">Salto del Circuit Breaker de la IA</label>
                  <select
                    value={customBreakerLimit}
                    onChange={(e) => setCustomBreakerLimit(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold"
                  >
                    <option value={3.2}>3.2% (Colchón de 0.8% de seguridad)</option>
                    <option value={3.5}>3.5% (Colchón de 0.5% de seguridad)</option>
                    <option value={2.8}>2.8% (Protección Máxima)</option>
                    <option value={4.2}>4.2% (Para cuentas con límite al 5.0%)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">Método de Cálculo del Broker</label>
                  <select
                    value={customCalcMode}
                    onChange={(e) => setCustomCalcMode(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold"
                  >
                    <option value="BALANCE_BASED">Balance Diario (FTMO, FundedNext)</option>
                    <option value="TRAILING_EQUITY">Trailing Intradía / Apex (Picos de Ganancia)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePropSettings}
                  disabled={isSavingSettings}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingSettings ? 'Guardando...' : 'Aplicar Ajustes al Servidor'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 1: LIBRO DETALLADO DE TRADES (JOURNAL) ─── */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Libro Detallado de Operaciones & Observaciones Post-Mortem</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cada orden registra el motivo de entrada, qué funcionó para alcanzar el TP, qué causó el SL y si hubo caza de liquidez manipulada.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setJournalFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  journalFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({botState?.closedTrades.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setJournalFilter('WIN')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  journalFilter === 'WIN' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Ganadoras TP ({botState?.winningTrades ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setJournalFilter('LOSS')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  journalFilter === 'LOSS' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                Perdedoras SL ({botState?.losingTrades ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setJournalFilter('WICK_HUNT')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  journalFilter === 'WICK_HUNT' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-amber-800'
                }`}
              >
                <span>Cazas Detectadas</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </button>
            </div>
          </div>

          {/* Trade Cards List */}
          <div className="space-y-3">
            {filteredTrades.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                No hay operaciones registradas con este filtro.
              </div>
            ) : (
              filteredTrades.map((trade) => {
                const isExpanded = expandedTradeId === trade.id;
                const isWin = trade.status === 'CLOSED_TP';
                const wasHunt = trade.postMortem?.wasWickHunt === true;
                const cushionSaved = trade.postMortem?.cushionSavedTrade === true;

                return (
                  <div 
                    key={trade.id} 
                    className={`rounded-2xl border transition bg-white shadow-2xs overflow-hidden ${
                      isExpanded ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header Row */}
                    <div 
                      onClick={() => setExpandedTradeId(isExpanded ? null : trade.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-gradient-to-r from-transparent via-transparent to-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 ${
                          isWin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isWin ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {trade.status === 'CLOSED_TP' ? 'GANADORA (TP)' : 'PERDEDORA (SL)'}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{trade.symbol}</span>
                            <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {trade.direction}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{trade.ticket}</span>
                          </div>
                          <span className="text-xs text-slate-500 block truncate max-w-md">
                            {trade.strategyName}
                          </span>
                        </div>
                      </div>

                      {/* Right metrics */}
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-left sm:text-right">
                          <div className={`font-mono font-bold text-sm ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isWin ? '+' : ''}{trade.pnlEur?.toFixed(2)} € ({trade.pnlPct?.toFixed(2)}%)
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {trade.lotSize} lotes · R: {trade.rMultiple ? `${trade.rMultiple}R` : '-'}
                          </div>
                        </div>

                        {/* Badges for Hunt or Saved */}
                        {wasHunt && (
                          <span className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Caza de Fondeo Detectada
                          </span>
                        )}
                        {cushionSaved && (
                          <span className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Salvado por Colchón
                          </span>
                        )}

                        <div className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/40 text-xs">
                        {/* Price metrics grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Precio Entrada</span>
                            <span className="font-mono font-bold text-slate-800 text-xs">{trade.entryPrice}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Spread: {trade.spreadAtEntryPips} pips</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Precio Salida</span>
                            <span className="font-mono font-bold text-slate-800 text-xs">{trade.exitPrice ?? '-'}</span>
                            <span className="text-[10px] text-slate-400 block">{trade.exitReason}</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Stop Loss Técnico</span>
                            <span className="font-mono font-bold text-rose-600 text-xs">{trade.slPrice}</span>
                            <span className="text-[10px] text-rose-500 block font-mono">-{trade.slPips} pips ({trade.riskPercent}% riesgo)</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Take Profit Objetivo</span>
                            <span className="font-mono font-bold text-emerald-600 text-xs">{trade.tpPrice}</span>
                            <span className="text-[10px] text-emerald-600 block font-mono">+{trade.tpPips} pips (1:2.3 R)</span>
                          </div>
                        </div>

                        {/* ─── DETAILED OBSERVATIONS BOX (POR QUÉ DIO BIEN / QUÉ ESTUVO MAL) ─── */}
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <FileText className="w-4 h-4 text-amber-600" />
                              Observaciones & Análisis Forense del Trade
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Hora apertura: {new Date(trade.timestamp).toLocaleTimeString('es-ES')} · Cierre: {trade.closeTimestamp ? new Date(trade.closeTimestamp).toLocaleTimeString('es-ES') : 'En curso'}
                            </span>
                          </div>

                          {/* Entry Rationale */}
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider mb-0.5">
                              1. Motivo de Entrada (Setup):
                            </span>
                            <p className="text-slate-600 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-sans">
                              {trade.entryRationale}
                            </p>
                          </div>

                          {/* Post-Mortem Analysis */}
                          <div>
                            <span className={`font-bold block text-[11px] uppercase tracking-wider mb-0.5 ${isWin ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isWin ? '2. ¿Por qué dio bien? (Factores de Éxito):' : '2. ¿Qué estuvo mal / Por qué dio SL? (Análisis del Fallo):'}
                            </span>
                            <div className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                              isWin ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950' : 'bg-rose-50/60 border-rose-200/80 text-rose-950'
                            }`}>
                              <p className="font-medium leading-relaxed">
                                {trade.postMortem?.detailedAnalysis}
                              </p>

                              {trade.postMortem?.lessonsLearned && (
                                <div className="pt-1.5 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px]">
                                  <span className="font-bold uppercase tracking-wide shrink-0">💡 Lección aprendida:</span>
                                  <span>{trade.postMortem.lessonsLearned}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Anti-Hunt Cushion Impact Indicator */}
                          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-900 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                Colchón Anti-Manipulación aplicado: <strong>+{trade.antiHuntCushionPips} pips</strong> fuera del soporte técnico.
                              </span>
                            </div>
                            <span className="font-semibold text-[11px] text-amber-800">
                              {cushionSaved ? '✅ Protegió la posición con éxito' : wasHunt ? '⚠️ Requiere mayor holgura' : 'Normal'}
                            </span>
                          </div>

                          {/* Operator Notes section with in-place editor */}
                          <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-700 text-[11px] uppercase">Notas Personales del Operador:</span>
                              {editingNotesId !== trade.id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNotesId(trade.id);
                                    setEditingNoteText(trade.operatorNotes || '');
                                  }}
                                  className="text-amber-700 hover:text-amber-800 font-semibold text-[11px] cursor-pointer"
                                >
                                  {trade.operatorNotes ? 'Editar Nota' : '+ Añadir Nota'}
                                </button>
                              )}
                            </div>

                            {editingNotesId === trade.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  placeholder="Escribe tus observaciones personales para este trade (ej. 'La apertura tuvo más volumen de lo normal...')"
                                  rows={2}
                                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNotesId(null)}
                                    className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-100 cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveNote(trade.id)}
                                    disabled={isSavingNote}
                                    className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Guardar</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-600 italic text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {trade.operatorNotes || 'Sin notas adicionales del operador.'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CALCULADORA DINÁMICA DE RIESGO (% Y PIPS) ─── */}
      {activeTab === 'calculator' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Dimensionamiento Dinámico: Tú defines el % de riesgo, el algoritmo decide los pips</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Elimina la incertidumbre de adivinar cuántos pips poner. El algoritmo analiza la volatilidad ATR en tiempo real, suma la holgura anti-caza y calcula el lotaje exacto para cumplir tu porcentaje al céntimo.
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {/* Asset Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                  1. Activo a Operar
                </label>
                <select
                  value={calcSymbol}
                  onChange={(e) => setCalcSymbol(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="S&P 500 (VOO/ES)">S&P 500 (VOO / Futuro ES)</option>
                  <option value="XAUUSD (Oro)">XAUUSD (Oro al Contado)</option>
                  <option value="EURUSD">EUR/USD (Euro Dólar)</option>
                  <option value="NASDAQ (QQQ)">NASDAQ 100 (QQQ)</option>
                  <option value="BTCUSD">Bitcoin (BTC / USD)</option>
                </select>
              </div>

              {/* Account Capital */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                  2. Capital de la Cuenta (€ / $)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={calcBalance}
                    onChange={(e) => setCalcBalance(Number(e.target.value))}
                    className="w-full p-2.5 pl-7 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-800"
                  />
                  <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-bold">€</span>
                </div>
              </div>

              {/* Risk % Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                  3. Riesgo por Operación (% Cuenta)
                </label>
                <div className="flex items-center gap-1.5">
                  {[0.5, 1.0, 1.5, 2.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCalcRiskPct(pct)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        calcRiskPct === pct
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Algorithm Output Box */}
            {calcResult && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-sm text-amber-200">
                      Resultado del Algoritmo para {calcResult.symbol}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Precio Referencia: {calcResult.currentPrice}
                  </span>
                </div>

                {/* Sizing Breakdown Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Riesgo Monetario Máx</span>
                    <span className="text-lg font-mono font-bold text-rose-400 mt-0.5 block">
                      €{calcResult.riskAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Exactamente el {calcResult.riskPercent}% de €{calcResult.balance}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 border border-amber-800/60">
                    <span className="text-[10px] font-bold text-amber-300 uppercase block">SL Decidido por Algoritmo</span>
                    <span className="text-lg font-mono font-bold text-amber-300 mt-0.5 block">
                      {calcResult.recommendedSlPips} pips
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ATR {calcResult.atrPips} + Colchón {calcResult.antiHuntCushionPips} + Horquilla {calcResult.spreadBufferPips}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 border border-emerald-800/60">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase block">Lotaje Exacto Calculado</span>
                    <span className="text-lg font-mono font-bold text-emerald-300 mt-0.5 block">
                      {calcResult.calculatedLots} lotes
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Fórmula: Riesgo / (Pips × ValorPip)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Take Profit Sugerido</span>
                    <span className="text-lg font-mono font-bold text-blue-300 mt-0.5 block">
                      +{calcResult.estimatedTpPips} pips
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Ratio {calcResult.riskRewardRatio} (+€{(calcResult.riskAmount * 2.2).toFixed(2)})
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {calcResult.algorithmExplanation}
                  </p>
                </div>

                {/* Execution Button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Nivel SL estimado (BUY): <strong className="text-rose-400">{calcResult.slPriceEstimateBuy}</strong> · TP estimado: <strong className="text-emerald-400">{calcResult.tpPriceEstimateBuy}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteOrder}
                    disabled={isExecuting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isExecuting ? 'Despachando a la Nube...' : 'Despachar Orden con estos Parámetros (24/7)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: MOTOR EVOLUTIVO ANTI-MANIPULACIÓN (FONDEO) ─── */}
      {activeTab === 'evolution' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Cómo el Algoritmo Evoluciona para Evitar Mechazos en Cuentas de Fondeo</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Las empresas de fondeo y brokers de CFDs frecuentemente amplían spreads o barren liquidez por 2 a 5 pips en los soportes antes de que el precio se dispare. El algoritmo aprende de cada falso stop y ajusta dinámicamente un colchón de seguridad.
              </p>
            </div>

            {/* Matrix of Cushions */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Matriz de Holgura Adaptativa por Activo (Anti-Hunt Cushions)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(botState?.cushionsBySymbol || {}).map(([sym, pips]) => (
                  <div key={sym} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{sym}</span>
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        +{pips} pips de colchón
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max={sym.includes('Oro') || sym.includes('BTC') ? 60 : 15}
                        step="0.5"
                        value={customCushions[sym] ?? pips}
                        onChange={(e) => setCustomCushions(prev => ({ ...prev, [sym]: Number(e.target.value) }))}
                        className="flex-1 accent-amber-600 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-slate-700 w-12 text-right">
                        {customCushions[sym] ?? pips} p
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSaveCushion(sym, customCushions[sym] ?? pips)}
                        disabled={isUpdatingCushion}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold cursor-pointer"
                        title="Fijar valor"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-500 block">
                      Protege el Stop Loss situándolo {pips} pips por fuera del soporte evidente para que el mechazo no expulse la orden.
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolutionary Timeline Log */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                Historial de Aprendizaje & Adaptaciones del Algoritmo en Vivo
              </span>

              <div className="space-y-2.5">
                {botState?.evolutionLog.map((evo) => (
                  <div key={evo.id} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                        {evo.symbol}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(evo.timestamp).toLocaleString('es-ES')}
                      </span>
                    </div>

                    <p className="text-slate-600 font-medium">
                      {evo.description}
                    </p>

                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-[11px] font-medium flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{evo.actionTaken}</span>
                      <span className="font-mono font-bold ml-auto text-emerald-800">
                        {evo.cushionBefore}p ➔ {evo.cushionAfter}p
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: ÓRDENES ACTIVAS EN VIVO ─── */}
      {activeTab === 'active_orders' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-purple-600" />
                  <span>Órdenes Corriendo en Segundo Plano en la Nube 24/7</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Estas órdenes son gestionadas por el servidor permanentemente sin importar si apagas tu ordenador o cierras el navegador.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExecuteOrder}
                disabled={isExecuting}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Abrir Posición Test</span>
              </button>
            </div>

            {botState?.activeOrders.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <Cloud className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">
                  No hay órdenes abiertas en este instante. El motor en la nube está analizando el mercado continuamente a la espera de que se cumpla alguna de las 3 estrategias.
                </p>
                <button
                  type="button"
                  onClick={handleExecuteOrder}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Disparar Entrada Inmediata</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {botState?.activeOrders.map((order) => (
                  <div key={order.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{order.symbol}</span>
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {order.direction}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{order.ticket}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        Iniciada: {new Date(order.timestamp).toLocaleTimeString('es-ES')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block">Entrada</span>
                        <span className="font-mono font-bold text-slate-800">{order.entryPrice}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                        <span className="text-[10px] text-blue-600 font-bold block">Precio En Vivo</span>
                        <span className="font-mono font-bold text-blue-800 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                          {order.currentPrice || order.entryPrice}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                        <span className="text-[10px] text-rose-500 font-bold block">Stop Loss Dinámico</span>
                        <span className="font-mono font-bold text-rose-700">{order.slPrice} (-{order.slPips}p)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                        <span className="text-[10px] text-emerald-600 font-bold block">Take Profit</span>
                        <span className="font-mono font-bold text-emerald-700">{order.tpPrice} (+{order.tpPips}p)</span>
                      </div>
                      <div className={`p-2 rounded-lg border ${
                        (order.floatingPnlEur ?? 0) >= 0 
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                          : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}>
                        <span className="text-[10px] font-bold block opacity-75">PnL Flotante (En Vivo)</span>
                        <span className="font-mono font-bold text-xs">
                          {(order.floatingPnlEur ?? 0) >= 0 ? '+' : ''}{(order.floatingPnlEur ?? 0).toFixed(2)} € ({(order.floatingPnlPct ?? 0) >= 0 ? '+' : ''}{(order.floatingPnlPct ?? 0).toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{order.entryRationale}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shrink-0">
                        🛡️ Blindaje Sentinel Activo (Kill Switch al {circuitBreakerThreshold}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 5: AJUSTES DE FONDEO & REGLAS ─── */}
      {activeTab === 'broker_prop' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>Reglas de Fondeo & Parámetros del Servidor</span>
            </h3>
            <p className="text-slate-500 mt-0.5">
              Ajustes de seguridad diseñados para superar evaluaciones de FTMO, FundedNext, Alpha Capital o cualquier prop firm sin romper reglas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Freno de Drawdown Diario (Hard Stop)</span>
              <p className="text-slate-500 text-[11px]">
                Si la cuenta alcanza una pérdida del 4% en el día, el bot apaga automáticamente la operativa hasta la siguiente sesión para proteger la cuenta.
              </p>
              <div className="font-mono font-bold text-emerald-700 bg-white p-2 rounded-lg border border-slate-200">
                Límite actual: {dailyDrawdownLimit}% máx. diario
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Protección de Horario de Rollover</span>
              <p className="text-slate-500 text-[11px]">
                Entre las 22:55 y las 23:15 CET los brokers abren los spreads artificialmente. El bot amplía los filtros de entrada durante esta ventana.
              </p>
              <div className="font-mono font-bold text-blue-700 bg-white p-2 rounded-lg border border-slate-200">
                Filtro de Rollover: ACTIVO
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Alojamiento Autónomo en la Nube</span>
              <p className="text-slate-500 text-[11px]">
                Corre directamente en el servidor de la aplicación. No requiere mantener encendida tu PC ni pagar tarifas eléctricas de 0.39 €/kWh.
              </p>
              <div className="font-mono font-bold text-amber-700 bg-white p-2 rounded-lg border border-slate-200">
                Consumo eléctrico en casa: 0 Watt
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

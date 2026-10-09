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
  LockKeyhole,
  Building2,
  Wallet,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Filter,
  ArrowUpRight,
  PieChart,
  Target,
  Terminal,
  SlidersHorizontal,
  Eye,
  ToggleLeft,
  ToggleRight,
  Search
} from 'lucide-react';
import { 
  DetailedTrade, 
  CloudBotState, 
  EvolutionaryAdjustment, 
  SizingCalculationResult,
  TradingAccount,
  AccountType,
  TickerTradingConfig,
  BotStrategyConfig,
  LiveScannerLog
} from '../../types/cloudBot';

export const CloudTradingDeskView: React.FC = () => {
  // ─── 1. CORE CLOUD BOT STATE ───
  const [botState, setBotState] = useState<CloudBotState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // ─── 2. ACTIVE WORKSPACE TAB ───
  // 'equity_sentinel' | 'strategies_hub' | 'accounts_hub' | 'journal' | 'evolution' | 'calculator' | 'active_orders' | 'broker_prop'
  const [activeTab, setActiveTab] = useState<'equity_sentinel' | 'strategies_hub' | 'accounts_hub' | 'journal' | 'evolution' | 'calculator' | 'active_orders' | 'broker_prop'>('strategies_hub');

  // ─── 2.0 TICKERS & STRATEGIES STATE ───
  const [tickerSearch, setTickerSearch] = useState<string>('');
  const [tickerCategoryFilter, setTickerCategoryFilter] = useState<'ALL' | 'INDICE' | 'COMMODITY' | 'FOREX' | 'CRYPTO'>('ALL');
  const [isTogglingTicker, setIsTogglingTicker] = useState<string | null>(null);
  const [isTogglingStrategy, setIsTogglingStrategy] = useState<string | null>(null);
  const [isForcingScan, setIsForcingScan] = useState<boolean>(false);
  const [isExecutingStrategyTrade, setIsExecutingStrategyTrade] = useState<boolean>(false);
  const [showAddTickerModal, setShowAddTickerModal] = useState<boolean>(false);
  const [newTickerSymbol, setNewTickerSymbol] = useState<string>('');
  const [newTickerDisplayName, setNewTickerDisplayName] = useState<string>('');
  const [newTickerCategory, setNewTickerCategory] = useState<'INDICE' | 'COMMODITY' | 'FOREX' | 'CRYPTO'>('FOREX');
  const [newTickerInitialStrat, setNewTickerInitialStrat] = useState<string>('Barrido de Liquidez & Reversión');
  const [isAddingTicker, setIsAddingTicker] = useState<boolean>(false);
  
  // Instant Trade Trigger Modal/Flyout
  const [showInstantExecModal, setShowInstantExecModal] = useState<boolean>(false);
  const [instantExecSymbol, setInstantExecSymbol] = useState<string>('S&P 500 (VOO/ES)');
  const [instantExecStrategyId, setInstantExecStrategyId] = useState<string>('');
  const [instantExecDirection, setInstantExecDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [instantExecRisk, setInstantExecRisk] = useState<number>(1.0);
  const [bannerTerminalExpanded, setBannerTerminalExpanded] = useState<boolean>(false);

  // ─── 2.1 SENTINEL & CIRCUIT BREAKER CONTROLS ───
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);
  const [isResettingBreaker, setIsResettingBreaker] = useState<boolean>(false);
  const [customDailyLimit, setCustomDailyLimit] = useState<number>(4.0);
  const [customBreakerLimit, setCustomBreakerLimit] = useState<number>(3.2);
  const [customCalcMode, setCustomCalcMode] = useState<'BALANCE_BASED' | 'TRAILING_EQUITY'>('BALANCE_BASED');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // ─── 2.2 MULTI-ACCOUNT & MULTI-BROKER MANAGEMENT STATE ───
  const [accountFilter, setAccountFilter] = useState<'ALL' | 'PROP_FIRM_EVAL' | 'PROP_FIRM_FUNDED' | 'BROKER_REAL' | 'BROKER_DEMO'>('ALL');
  const [isSwitchingAccount, setIsSwitchingAccount] = useState<boolean>(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState<boolean>(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);

  // New Account Form
  const [newAccName, setNewAccName] = useState<string>('FTMO Challenge $100k');
  const [newAccBroker, setNewAccBroker] = useState<string>('FTMO');
  const [newAccType, setNewAccType] = useState<AccountType>('PROP_FIRM_EVAL');
  const [newAccNumber, setNewAccNumber] = useState<string>('');
  const [newAccServer, setNewAccServer] = useState<string>('FTMO-Live2');
  const [newAccCurrency, setNewAccCurrency] = useState<'EUR' | 'USD' | 'GBP'>('USD');
  const [newAccInitialCap, setNewAccInitialCap] = useState<number>(100000);
  const [newAccDailyLimit, setNewAccDailyLimit] = useState<number>(5.0);
  const [newAccBreaker, setNewAccBreaker] = useState<number>(4.0);
  const [newAccCalcMode, setNewAccCalcMode] = useState<'BALANCE_BASED' | 'TRAILING_EQUITY'>('BALANCE_BASED');
  const [newAccTotalDrawdown, setNewAccTotalDrawdown] = useState<number>(10.0);
  const [newAccMaxRisk, setNewAccMaxRisk] = useState<number>(1.0);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);

  // Multi-Execution / Copy Trading state
  const [multiExecSymbol, setMultiExecSymbol] = useState<string>('S&P 500 (VOO/ES)');
  const [multiExecDirection, setMultiExecDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [multiExecRiskPct, setMultiExecRiskPct] = useState<number>(1.0);
  const [isDispatchingMulti, setIsDispatchingMulti] = useState<boolean>(false);

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

  // ─── MULTI-ACCOUNT MANAGEMENT HANDLERS ───
  const handleSwitchAccount = async (accountId: string) => {
    setIsSwitchingAccount(true);
    try {
      const res = await fetch('/api/cloud-bot/accounts/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      if (res.ok) {
        const json = await res.json();
        setBotState(json.state);
        setStatusMessage(json.message);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleToggleAccountActive = async (accountId: string) => {
    try {
      const res = await fetch(`/api/cloud-bot/accounts/${accountId}/toggle`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (botState) {
          setBotState({ ...botState, accounts: json.accounts });
        }
        setStatusMessage(json.message);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!window.confirm('¿Seguro que deseas desvincular esta cuenta del Centro de Mando?')) return;
    try {
      const res = await fetch(`/api/cloud-bot/accounts/${accountId}/delete`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (botState) {
          setBotState({
            ...botState,
            accounts: json.accounts,
            activeAccountId: json.activeAccountId
          });
        }
        setStatusMessage(json.message);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const applyAccountPreset = (preset: 'FTMO_100K' | 'FUNDEDNEXT_50K' | 'TOPSTEP_50K' | 'IC_MARKETS_DEMO' | 'IBKR_REAL') => {
    switch (preset) {
      case 'FTMO_100K':
        setNewAccName('FTMO Reto Evaluación $100k');
        setNewAccBroker('FTMO');
        setNewAccType('PROP_FIRM_EVAL');
        setNewAccCurrency('USD');
        setNewAccInitialCap(100000);
        setNewAccDailyLimit(5.0);
        setNewAccBreaker(4.0);
        setNewAccCalcMode('BALANCE_BASED');
        setNewAccTotalDrawdown(10.0);
        setNewAccMaxRisk(1.0);
        setNewAccServer('FTMO-Live2');
        break;
      case 'FUNDEDNEXT_50K':
        setNewAccName('FundedNext Financiada €50k (Real)');
        setNewAccBroker('FundedNext');
        setNewAccType('PROP_FIRM_FUNDED');
        setNewAccCurrency('EUR');
        setNewAccInitialCap(50000);
        setNewAccDailyLimit(4.0);
        setNewAccBreaker(3.2);
        setNewAccCalcMode('BALANCE_BASED');
        setNewAccTotalDrawdown(8.0);
        setNewAccMaxRisk(0.75);
        setNewAccServer('FundedNext-Live01');
        break;
      case 'TOPSTEP_50K':
        setNewAccName('Topstep / Apex Futuros $50k');
        setNewAccBroker('Topstep');
        setNewAccType('PROP_FIRM_EVAL');
        setNewAccCurrency('USD');
        setNewAccInitialCap(50000);
        setNewAccDailyLimit(3.5);
        setNewAccBreaker(2.8);
        setNewAccCalcMode('TRAILING_EQUITY');
        setNewAccTotalDrawdown(5.0);
        setNewAccMaxRisk(0.5);
        setNewAccServer('Rithmic-Live01');
        break;
      case 'IC_MARKETS_DEMO':
        setNewAccName('IC Markets Demo Scalp €10k');
        setNewAccBroker('IC Markets');
        setNewAccType('BROKER_DEMO');
        setNewAccCurrency('EUR');
        setNewAccInitialCap(10000);
        setNewAccDailyLimit(5.0);
        setNewAccBreaker(3.5);
        setNewAccCalcMode('BALANCE_BASED');
        setNewAccTotalDrawdown(10.0);
        setNewAccMaxRisk(1.0);
        setNewAccServer('ICMarketsSC-Demo02');
        break;
      case 'IBKR_REAL':
        setNewAccName('Interactive Brokers Real €25k');
        setNewAccBroker('Interactive Brokers');
        setNewAccType('BROKER_REAL');
        setNewAccCurrency('EUR');
        setNewAccInitialCap(25000);
        setNewAccDailyLimit(3.0);
        setNewAccBreaker(2.5);
        setNewAccCalcMode('BALANCE_BASED');
        setNewAccTotalDrawdown(6.0);
        setNewAccMaxRisk(0.5);
        setNewAccServer('IBKR-Gateway');
        break;
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    setIsCreatingAccount(true);
    try {
      const res = await fetch('/api/cloud-bot/accounts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccName.trim(),
          broker: newAccBroker,
          accountType: newAccType,
          accountNumber: newAccNumber.trim() || undefined,
          server: newAccServer.trim() || undefined,
          currency: newAccCurrency,
          initialCapital: newAccInitialCap,
          dailyDrawdownLimitPct: newAccDailyLimit,
          circuitBreakerThresholdPct: newAccBreaker,
          calculationMode: newAccCalcMode,
          totalDrawdownLimitPct: newAccTotalDrawdown,
          maxRiskPerTradePct: newAccMaxRisk
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (botState) {
          setBotState({ ...botState, accounts: json.accounts });
        }
        setShowNewAccountModal(false);
        setStatusMessage(json.message);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    try {
      const res = await fetch(`/api/cloud-bot/accounts/${editingAccount.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAccount)
      });
      if (res.ok) {
        const json = await res.json();
        if (botState) {
          setBotState({ ...botState, accounts: json.accounts });
        }
        setShowEditAccountModal(false);
        setEditingAccount(null);
        setStatusMessage(json.message);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchMultiAccountTrade = async () => {
    setIsDispatchingMulti(true);
    try {
      const res = await fetch('/api/cloud-bot/accounts/multi-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: multiExecSymbol,
          direction: multiExecDirection,
          riskPercent: multiExecRiskPct
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchBotState();
        setStatusMessage(`🚀 EJECUCIÓN MULTI-BROKER EXITOSA: ${json.message}`);
        setTimeout(() => setStatusMessage(null), 6000);
      } else {
        setStatusMessage(`❌ Error: ${json.error || 'No se pudo despachar la orden multi-cuenta'}`);
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDispatchingMulti(false);
    }
  };

  // ─── TICKERS & STRATEGIES HANDLERS ───
  const handleToggleTicker = async (symbol: string) => {
    setIsTogglingTicker(symbol);
    try {
      const res = await fetch('/api/cloud-bot/tickers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (botState) {
          const updatedTickers = botState.tickerConfigs.map(t => 
            t.symbol === symbol ? { ...t, isActive: json.ticker.isActive } : t
          );
          setBotState({ ...botState, tickerConfigs: updatedTickers });
        }
        setStatusMessage(json.message);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTogglingTicker(null);
    }
  };

  const handleToggleStrategy = async (symbol: string, strategyId: string) => {
    setIsTogglingStrategy(strategyId);
    try {
      const res = await fetch('/api/cloud-bot/tickers/strategy/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, strategyId })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (botState) {
          const updatedTickers = botState.tickerConfigs.map(t => {
            if (t.symbol !== symbol) return t;
            return {
              ...t,
              strategies: t.strategies.map(s => 
                s.id === strategyId ? { ...s, isEnabled: json.strategy.isEnabled } : s
              )
            };
          });
          setBotState({ ...botState, tickerConfigs: updatedTickers });
        }
        setStatusMessage(json.message);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTogglingStrategy(null);
    }
  };

  const handleChangeTriggerMode = async (symbol: string, triggerMode: 'ANY_TRIGGERS' | 'CONFLUENCE_ALL') => {
    try {
      const res = await fetch('/api/cloud-bot/tickers/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, triggerMode })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (botState) {
          const updatedTickers = botState.tickerConfigs.map(t => 
            t.symbol === symbol ? { ...t, triggerMode: json.ticker.triggerMode } : t
          );
          setBotState({ ...botState, tickerConfigs: updatedTickers });
        }
        setStatusMessage(json.message);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleForceScan = async () => {
    setIsForcingScan(true);
    try {
      const res = await fetch('/api/cloud-bot/scanner/force-scan', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        if (botState) {
          setBotState({
            ...botState,
            ticksProcessedToday: json.ticksProcessedToday,
            scannerLogs: json.scannerLogs
          });
        }
        setStatusMessage('⚡ Escaneo inmediato ejecutado en el servidor cloud Node.js (12ms de latencia)');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsForcingScan(false);
    }
  };

  const handleExecuteStrategyDirectly = async (symbol: string, strategyId: string, direction: 'BUY' | 'SELL', riskPct: number) => {
    setIsExecutingStrategyTrade(true);
    try {
      const res = await fetch('/api/cloud-bot/tickers/execute-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          strategyId,
          direction,
          riskPercent: riskPct,
          accountId: currentActiveId
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchBotState();
        setShowInstantExecModal(false);
        setStatusMessage(`⚡ ORDEN DISPARADA EN LA NUBE: ${json.message}`);
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage(`❌ ${json.error || 'No se pudo ejecutar la orden'}`);
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecutingStrategyTrade(false);
    }
  };

  const handleCreateTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerSymbol.trim()) return;
    setIsAddingTicker(true);
    try {
      const res = await fetch('/api/cloud-bot/tickers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newTickerSymbol.trim().toUpperCase(),
          displayName: newTickerDisplayName.trim() || newTickerSymbol.trim().toUpperCase(),
          category: newTickerCategory,
          defaultStrategyName: newTickerInitialStrat.trim() || 'Barrido de Liquidez & Reversión'
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (botState) {
          setBotState({ ...botState, tickerConfigs: json.tickers });
        }
        setShowAddTickerModal(false);
        setNewTickerSymbol('');
        setNewTickerDisplayName('');
        setStatusMessage(`✅ Ticker ${json.ticker.symbol} incorporado al escáner cloud`);
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setStatusMessage(`❌ Error: ${json.error || 'No se pudo añadir el ticker'}`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingTicker(false);
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

  // Filtered tickers for Strategies Hub
  const filteredTickers = useMemo(() => {
    const list = botState?.tickerConfigs || [];
    return list.filter(t => {
      if (tickerCategoryFilter !== 'ALL' && t.category !== tickerCategoryFilter) return false;
      if (tickerSearch.trim()) {
        const q = tickerSearch.toLowerCase();
        const matchSymbol = t.symbol.toLowerCase().includes(q);
        const matchName = t.displayName.toLowerCase().includes(q);
        const matchStrat = t.strategies.some(s => s.strategyName.toLowerCase().includes(q));
        if (!matchSymbol && !matchName && !matchStrat) return false;
      }
      return true;
    });
  }, [botState?.tickerConfigs, tickerCategoryFilter, tickerSearch]);

  // Multi-Account Portfolio Data (All hooks MUST be called unconditionally at top)
  const accounts = botState?.accounts || [];
  const currentActiveId = botState?.activeAccountId || accounts[0]?.id;
  const activeAccount = accounts.find(a => a.id === currentActiveId) || accounts[0];

  const totalPortfolioBalance = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (a.currency === 'USD' ? a.balance * 0.93 : a.balance), 0);
  }, [accounts]);

  const totalPortfolioEquity = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (a.currency === 'USD' ? a.currentEquity * 0.93 : a.currentEquity), 0);
  }, [accounts]);

  const totalPortfolioNetPnl = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (a.currency === 'USD' ? a.netPnlEur * 0.93 : a.netPnlEur), 0);
  }, [accounts]);

  // Tickers & Strategies counts
  const tickerConfigs = botState?.tickerConfigs || [];
  const activeTickers = tickerConfigs.filter(t => t.isActive);
  const totalStrategiesCount = tickerConfigs.reduce((sum, t) => sum + t.strategies.length, 0);
  const activeStrategiesCount = tickerConfigs.reduce((sum, t) => sum + t.strategies.filter(s => s.isEnabled && t.isActive).length, 0);
  const latestScannerLogs = botState?.scannerLogs || [];

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
                Operativa desasistida con motor multi-cuenta, anti-caza y Guardián de Floating Equity para empresas de fondeo y brokers.
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

        {/* ─── LIVE HEARTBEAT & CLOUD ENGINE STATUS (VERIFIES REAL 24/7 ACTIVITY) ─── */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-700/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRunning ? 'bg-emerald-400 opacity-75' : 'bg-rose-400 opacity-75'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className="font-bold text-white font-mono text-[11px]">
                {isRunning ? 'Escaneando cada 4s en Servidor Cloud' : 'Escáner en Pausa'}
              </span>
            </div>
            <div className="text-slate-300 font-mono text-[11px] flex items-center gap-2 flex-wrap">
              <span className="text-slate-500">·</span>
              <span className="text-emerald-300 font-semibold">{activeTickers.length} de {tickerConfigs.length} Tickers Activos</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-300 font-semibold">{activeStrategiesCount} Estrategias Escaneando</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{botState?.ticksProcessedToday ?? 1420} ticks procesados hoy</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('strategies_hub')}
              className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                activeTab === 'strategies_hub'
                  ? 'bg-emerald-500 ring-2 ring-emerald-300'
                  : 'bg-emerald-700 hover:bg-emerald-600'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Elegir Tickets & Estrategias</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (tickerConfigs.length > 0) {
                  setInstantExecSymbol(tickerConfigs[0].symbol);
                  setInstantExecStrategyId(tickerConfigs[0].strategies[0]?.id || '');
                }
                setShowInstantExecModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Disparo Inmediato</span>
            </button>

            <button
              type="button"
              onClick={() => setBannerTerminalExpanded(!bannerTerminalExpanded)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition cursor-pointer ${
                bannerTerminalExpanded 
                  ? 'bg-slate-800 text-amber-300 border-amber-500/50' 
                  : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="Mostrar terminal de escaneo en tiempo real"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>{bannerTerminalExpanded ? 'Ocultar Terminal' : 'Ver Terminal (En Vivo)'}</span>
            </button>
          </div>
        </div>

        {/* ─── EXPANDABLE REAL-TIME SCANNER TERMINAL ─── */}
        {bannerTerminalExpanded && (
          <div className="bg-black/95 rounded-xl p-3 border border-emerald-500/30 font-mono text-[11px] text-emerald-400 space-y-1.5 max-h-52 overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Terminal className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>TERMINAL DE ESCANEO CLOUD 24/7 (NODE.JS SERVER · INDEPENDIENTE DE PC)</span>
              </span>
              <button
                type="button"
                onClick={handleForceScan}
                disabled={isForcingScan}
                className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[9px] cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isForcingScan ? 'animate-spin' : ''}`} />
                <span>{isForcingScan ? 'Escaneando...' : '⚡ Forzar Tick de Prueba'}</span>
              </button>
            </div>
            {latestScannerLogs.slice(0, 6).map(log => (
              <div key={log.id} className="flex items-start gap-2 leading-tight py-0.5">
                <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString('es-ES')}]</span>
                <span className="text-amber-400 shrink-0 font-bold">{log.symbol}:</span>
                <span className="text-slate-200">{log.message.replace(/^\[.*?\]\s*/, '')}</span>
                {log.latencyMs && (
                  <span className="text-slate-500 text-[10px] shrink-0 ml-auto">{log.latencyMs}ms</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── MULTI-ACCOUNT QUICK SWITCHER BAR ─── */}
        <div className="pt-3 pb-1 border-t border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Cuenta Activa:</span>
            </span>
            {accounts.map(acc => {
              const isSelected = acc.id === currentActiveId;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSwitchAccount(acc.id)}
                  disabled={isSwitchingAccount}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-2 ring-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                  title={`${acc.name} (${acc.server}) - Saldo: ${acc.balance} ${acc.currency}`}
                >
                  <span className={`w-2 h-2 rounded-full ${acc.isActive ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-slate-500'}`} />
                  <span className="font-bold">{acc.broker}</span>
                  <span className="font-mono text-[11px] opacity-90">
                    {acc.currency === 'USD' ? '$' : '€'}{(acc.balance).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                  </span>
                  {acc.accountType === 'PROP_FIRM_EVAL' && (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isSelected ? 'bg-slate-900 text-amber-200' : 'bg-slate-900 text-amber-300'}`}>
                      Reto
                    </span>
                  )}
                  {acc.accountType === 'PROP_FIRM_FUNDED' && (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'}`}>
                      Fondeada
                    </span>
                  )}
                  {acc.accountType === 'BROKER_REAL' && (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isSelected ? 'bg-blue-950 text-blue-200' : 'bg-blue-950 text-blue-300'}`}>
                      Real
                    </span>
                  )}
                  {acc.accountType === 'BROKER_DEMO' && (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isSelected ? 'bg-purple-950 text-purple-200' : 'bg-purple-950 text-purple-300'}`}>
                      Demo
                    </span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                applyAccountPreset('FTMO_100K');
                setShowNewAccountModal(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-dashed border-amber-500/60 flex items-center gap-1.5 shrink-0 cursor-pointer transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Cuenta</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('accounts_hub')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeTab === 'accounts_hub'
                  ? 'bg-white text-slate-900'
                  : 'bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Gestor Multi-Cuentas ({accounts.length})</span>
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
          onClick={() => setActiveTab('strategies_hub')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'strategies_hub'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400 font-bold'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Target className={`w-4 h-4 ${activeTab === 'strategies_hub' ? 'text-white' : 'text-emerald-500'}`} />
          <span>🎯 Tickets & Estrategias Operativas</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
            activeTab === 'strategies_hub' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
          }`}>
            {activeTickers.length} tickets / {activeStrategiesCount} est.
          </span>
        </button>

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
          onClick={() => setActiveTab('accounts_hub')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'accounts_hub'
              ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === 'accounts_hub' ? 'text-white' : 'text-amber-500'}`} />
          <span>Multi-Cuentas & Brokers</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
            activeTab === 'accounts_hub' ? 'bg-amber-800 text-amber-100' : 'bg-slate-100 text-slate-700'
          }`}>
            {accounts.length}
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

      {/* ─── TAB: MATRIZ DE OPERATIVA: SELECCIÓN DE TICKETS Y ESTRATEGIAS 24/7 ─── */}
      {activeTab === 'strategies_hub' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Hero Instructions & Live Engine Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>Matriz de Operativa: Selección de Tickets y Estrategias 24/7</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configura qué símbolos opera el bot, qué estrategias aplica a cada uno y el modo de disparo (independiente o por confluencia).
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleForceScan}
                  disabled={isForcingScan}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                  title="Ejecuta un ciclo de escaneo forzado en el servidor Node.js al instante"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isForcingScan ? 'animate-spin' : ''}`} />
                  <span>{isForcingScan ? 'Escaneando Servidor...' : '⚡ Forzar Tick de Escaneo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddTickerModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Ticker / Símbolo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (tickerConfigs.length > 0) {
                      setInstantExecSymbol(tickerConfigs[0].symbol);
                      setInstantExecStrategyId(tickerConfigs[0].strategies[0]?.id || '');
                    }
                    setShowInstantExecModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Disparo Inmediato de Prueba</span>
                </button>
              </div>
            </div>

            {/* Explanation Notice & Cloud Autonomy Clarification */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-3">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-emerald-900">
                  ¿Cómo opera la IA en segundo plano 24/7 sin tu intervención?
                </p>
                <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                  El bot se ejecuta en el servidor central de Node.js de forma ininterrumpida. Cada 4 segundos evalúa las velas de los tickets marcados como <span className="font-bold underline">ACTIVOS</span> abajo. Si las reglas técnicas de sus estrategias habilitadas se cumplen, el algoritmo calcula automáticamente el lotaje exacto para tu riesgo definido (por ej. 1%) y añade un <span className="font-bold">colchón de holgura anti-mechazos</span> en el Stop Loss para que las cazas de los brokers de fondeo no te expulsen. Si prefieres no esperar a que el mercado dé señal natural, puedes pulsar <span className="font-bold">"⚡ Disparar BUY/SELL Ahora"</span> en cualquiera de las estrategias para ejecutar una posición de prueba al instante.
                </p>
              </div>
            </div>

            {/* Live KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tickers en Escáner</span>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5 flex items-center gap-1.5">
                  <span>{activeTickers.length} de {tickerConfigs.length}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">ACTIVOS</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Monitoreo continuo en servidor
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estrategias Habilitadas</span>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5 flex items-center gap-1.5">
                  <span>{activeStrategiesCount} de {totalStrategiesCount}</span>
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  SMC, Wick Hunter, Breakouts, VWAP
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ciclos de Mercado Hoy</span>
                <div className="text-base font-bold text-emerald-700 font-mono mt-0.5 flex items-center gap-1.5">
                  <span>{botState?.ticksProcessedToday ?? 1420} ticks</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Escaneando cada 4 seg (Latencia ~11ms)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cuenta Destino Activa</span>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5 flex items-center gap-1.5 truncate">
                  <span className="truncate">{activeAccount ? activeAccount.broker : 'Broker Activo'}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded font-sans shrink-0">
                    {activeAccount?.currency === 'USD' ? '$' : '€'}{(activeAccount?.balance ?? balance).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                  {activeAccount?.name || 'Cuenta Primaria'}
                </span>
              </div>
            </div>
          </div>

          {/* Category Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTickerCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  tickerCategoryFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Todos ({tickerConfigs.length})
              </button>

              <button
                type="button"
                onClick={() => setTickerCategoryFilter('INDICE')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  tickerCategoryFilter === 'INDICE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Índices (S&P 500 / NASDAQ)
              </button>

              <button
                type="button"
                onClick={() => setTickerCategoryFilter('COMMODITY')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  tickerCategoryFilter === 'COMMODITY'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Commodities (Oro XAUUSD)
              </button>

              <button
                type="button"
                onClick={() => setTickerCategoryFilter('FOREX')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  tickerCategoryFilter === 'FOREX'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Forex (EURUSD)
              </button>

              <button
                type="button"
                onClick={() => setTickerCategoryFilter('CRYPTO')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  tickerCategoryFilter === 'CRYPTO'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Cripto (Bitcoin)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tickerSearch}
                onChange={(e) => setTickerSearch(e.target.value)}
                placeholder="Buscar ticket o estrategia..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tickers & Strategies Interactive Cards Grid */}
          <div className="space-y-5">
            {filteredTickers.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <Target className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No se encontraron tickets con el filtro actual</p>
                <button
                  type="button"
                  onClick={() => {
                    setTickerCategoryFilter('ALL');
                    setTickerSearch('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              filteredTickers.map((ticker) => {
                const isTogglingThis = isTogglingTicker === ticker.symbol;
                const activeStratsInTicker = ticker.strategies.filter(s => s.isEnabled).length;

                return (
                  <div
                    key={ticker.symbol}
                    className={`bg-white rounded-2xl border transition shadow-2xs overflow-hidden ${
                      ticker.isActive
                        ? 'border-emerald-300 ring-1 ring-emerald-400/30'
                        : 'border-slate-200 opacity-90'
                    }`}
                  >
                    {/* Ticker Header Bar */}
                    <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${
                          ticker.isActive
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-white tracking-tight">
                              {ticker.symbol}
                            </span>
                            <span className="text-xs text-slate-300 font-medium">
                              · {ticker.displayName}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {ticker.category}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-300 mt-0.5 block">
                            {activeStratsInTicker} de {ticker.strategies.length} estrategias activas · 1 orden máx simultánea
                          </span>
                        </div>
                      </div>

                      {/* Right Controls: Trigger Mode & Master Toggle */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Trigger Mode Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
                          <span className="text-[10px] text-slate-400 px-1 font-semibold">Modo:</span>
                          <button
                            type="button"
                            onClick={() => handleChangeTriggerMode(ticker.symbol, 'ANY_TRIGGERS')}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              ticker.triggerMode === 'ANY_TRIGGERS'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'text-slate-300 hover:text-white'
                            }`}
                            title="Cualquiera de las estrategias que dé señal abre posición independientemente"
                          >
                            ⚡ Disparo Libre
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeTriggerMode(ticker.symbol, 'CONFLUENCE_ALL')}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              ticker.triggerMode === 'CONFLUENCE_ALL'
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'text-slate-300 hover:text-white'
                            }`}
                            title="Requiere que todas las estrategias activas coincidan para disparar"
                          >
                            🎯 Confluencia
                          </button>
                        </div>

                        {/* Master Ticker Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleTicker(ticker.symbol)}
                          disabled={isTogglingThis}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            ticker.isActive
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {isTogglingThis ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : ticker.isActive ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Pause className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{ticker.isActive ? 'OPERATIVA ACTIVA 24/7' : 'PAUSADO'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Strategies List for this Ticker */}
                    <div className="p-4 space-y-3.5 bg-slate-50/50">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200">
                        <span className="flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                          <span>Estrategias Disponibles para {ticker.symbol}</span>
                        </span>
                        <span className="text-[11px] font-normal text-slate-500">
                          {ticker.isActive ? 'El bot evalúa estas reglas en cada tick del servidor' : 'Ticker en pausa (no operará hasta activarlo)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {ticker.strategies.map((strat) => {
                          const isTogglingThisStrat = isTogglingStrategy === strat.id;

                          return (
                            <div
                              key={strat.id}
                              className={`p-3.5 rounded-xl border transition space-y-3 ${
                                strat.isEnabled
                                  ? 'bg-white border-slate-200 shadow-2xs ring-1 ring-emerald-500/20'
                                  : 'bg-slate-100/60 border-slate-200 opacity-75'
                              }`}
                            >
                              {/* Strategy Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-start sm:items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                    {strat.strategyName}
                                  </span>

                                  {/* Category Badge */}
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    strat.category === 'LIQUIDITY_SWEEP'
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : strat.category === 'TREND_PULLBACK'
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : strat.category === 'SESSION_BREAKOUT'
                                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}>
                                    {strat.category === 'LIQUIDITY_SWEEP' && 'SMC · Barrido de Liquidez'}
                                    {strat.category === 'TREND_PULLBACK' && 'Pullback Tendencial'}
                                    {strat.category === 'SESSION_BREAKOUT' && 'Rotura de Rango'}
                                    {strat.category === 'VOLATILITY_EXPANSION' && 'Volatilidad Extrema'}
                                  </span>

                                  {/* Timeframe Badge */}
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                                    {strat.timeframe}
                                  </span>

                                  {/* Direction Badge */}
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                                    {strat.direction}
                                  </span>
                                </div>

                                {/* Strategy Toggle Switch */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStrategy(ticker.symbol, strat.id)}
                                    disabled={isTogglingThisStrat}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                                      strat.isEnabled
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                                  >
                                    {isTogglingThisStrat ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : strat.isEnabled ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Pause className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                    <span>{strat.isEnabled ? 'Habilitada' : 'En Pausa'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Parameters & Historical Win Rate Strip */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Riesgo por Entrada</span>
                                  <span className="font-mono font-bold text-slate-800">{strat.riskPercent}% del capital</span>
                                </div>

                                <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60">
                                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Colchón Anti-Mechazos</span>
                                  <span className="font-mono font-bold text-amber-900">+{strat.antiHuntCushionPips} pips extra SL</span>
                                </div>

                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Tasa de Acierto</span>
                                  <span className="font-mono font-bold text-emerald-700">{strat.winRatePct}% ({strat.tradesGenerated} trades)</span>
                                </div>

                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Estado del Algoritmo</span>
                                  <span className="font-mono font-bold text-slate-700 text-[11px] truncate block">
                                    {strat.status.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </div>

                              {/* Real-time Rules Evaluation Checklist */}
                              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Condiciones en Tiempo Real para Ejecutar Orden:
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  {strat.rules.map((rule) => (
                                    <div
                                      key={rule.id}
                                      className={`p-2 rounded-lg border flex flex-col justify-between ${
                                        rule.isMet
                                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                          : 'bg-white border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                          <span className="font-bold text-[11px] truncate" title={rule.name}>
                                            {rule.name}
                                          </span>
                                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono shrink-0 ${
                                            rule.isMet
                                              ? 'bg-emerald-200 text-emerald-800'
                                              : 'bg-slate-100 text-slate-600'
                                          }`}>
                                            {rule.isMet ? 'CUMPLIDA' : 'ESPERANDO'}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-tight">
                                          {rule.description}
                                        </p>
                                      </div>
                                      {rule.currentValue && (
                                        <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] font-mono font-semibold text-slate-600">
                                          Lectura: {rule.currentValue}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Manual Single-Click Execution Bar */}
                              <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
                                <span className="text-[11px] text-slate-500">
                                  ¿Quieres probar esta estrategia ya mismo sin esperar al barrido natural?
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleExecuteStrategyDirectly(ticker.symbol, strat.id, 'BUY', strat.riskPercent)}
                                    disabled={isExecutingStrategyTrade}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                  >
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>⚡ Disparar BUY Ahora</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExecuteStrategyDirectly(ticker.symbol, strat.id, 'SELL', strat.riskPercent)}
                                    disabled={isExecutingStrategyTrade}
                                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                  >
                                    <TrendingDown className="w-3.5 h-3.5" />
                                    <span>⚡ Disparar SELL Ahora</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ─── LIVE CLOUD SCANNER TERMINAL (HEARTBEAT LOGS) ─── */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 text-white space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h4 className="font-bold text-sm text-slate-200">
                  Consola de Telemetría del Escáner Cloud 24/7 (Registro de Segundo Plano)
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Ticks Hoy: {botState?.ticksProcessedToday ?? 1420}</span>
                <button
                  type="button"
                  onClick={handleForceScan}
                  disabled={isForcingScan}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-sans font-semibold cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isForcingScan ? 'animate-spin' : ''}`} />
                  <span>Forzar Tick</span>
                </button>
              </div>
            </div>

            <div className="bg-black/90 rounded-xl p-3 font-mono text-xs text-emerald-400 max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin">
              {latestScannerLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 shrink-0">
                    [{new Date(log.timestamp).toLocaleTimeString('es-ES')}]
                  </span>
                  <span className="text-amber-400 shrink-0 font-bold">
                    {log.symbol}:
                  </span>
                  <span className="text-slate-300">
                    {log.message.replace(/^\[.*?\]\s*/, '')}
                  </span>
                  {log.latencyMs && (
                    <span className="text-slate-500 text-[10px] shrink-0 ml-auto">
                      {log.latencyMs}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              * Este registro refleja los latidos del proceso en Node.js. Si dejas la aplicación o cierras el navegador, el servidor continúa escaneando y abriendo posiciones de acuerdo a tus estrategias.
            </p>
          </div>
        </div>
      )}

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

      {/* ─── TAB: GESTOR MULTI-CUENTAS & BROKERS (PORTFOLIO HUB) ─── */}
      {activeTab === 'accounts_hub' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Quick Action Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                      Gestor Multi-Cuentas & Multi-Broker
                    </h2>
                    <p className="text-xs text-slate-500">
                      Supervisa, mide y opera en simultáneo múltiples cuentas de retos de fondeo, firmas financiadas, brokers con capital propio y demos de pruebas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    applyAccountPreset('FTMO_100K');
                    setShowNewAccountModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Vincular Nueva Cuenta</span>
                </button>
              </div>
            </div>

            {/* Consolidado Global de Cartera (Portfolio Aggregator) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Capital Total Gestionado</span>
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-white mt-1">
                  €{totalPortfolioBalance.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <span className="text-[10px] text-slate-400">
                  {accounts.length} cuentas combinadas
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 text-emerald-100 border border-emerald-800/60">
                <div className="flex items-center justify-between text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>Equity Flotante Consolidado</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-white mt-1">
                  €{totalPortfolioEquity.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  +€{(totalPortfolioEquity - totalPortfolioBalance).toFixed(2)} flotante en vivo
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <span>PnL Neto Acumulado</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 mt-1">
                  +€{totalPortfolioNetPnl.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Rentabilidad positiva global
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <span>Tasa Supervivencia Fondeo</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-blue-700 mt-1">
                  100% Vivas
                </div>
                <span className="text-[10px] text-slate-500">
                  0 cuentas suspendidas por reglas
                </span>
              </div>

              <div className="col-span-2 md:col-span-1 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                  <span>Cuentas en Trading</span>
                  <Cpu className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-amber-900 mt-1">
                  {accounts.filter(a => a.isActive).length} / {accounts.length} Activas
                </div>
                <span className="text-[10px] text-amber-700 font-semibold">
                  Autónomas en la nube 24/7
                </span>
              </div>
            </div>

            {/* Account Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100 text-xs font-semibold">
              <span className="text-slate-400 text-[11px] flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Filtrar:
              </span>
              <button
                type="button"
                onClick={() => setAccountFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  accountFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({accounts.length})
              </button>
              <button
                type="button"
                onClick={() => setAccountFilter('PROP_FIRM_EVAL')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  accountFilter === 'PROP_FIRM_EVAL'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>Retos Evaluación</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {accounts.filter(a => a.accountType === 'PROP_FIRM_EVAL').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAccountFilter('PROP_FIRM_FUNDED')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  accountFilter === 'PROP_FIRM_FUNDED'
                    ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>Fondeadas Reales</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {accounts.filter(a => a.accountType === 'PROP_FIRM_FUNDED').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAccountFilter('BROKER_REAL')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  accountFilter === 'BROKER_REAL'
                    ? 'bg-blue-700 text-white shadow-2xs font-bold'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <span>Brokers Reales</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {accounts.filter(a => a.accountType === 'BROKER_REAL').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAccountFilter('BROKER_DEMO')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  accountFilter === 'BROKER_DEMO'
                    ? 'bg-purple-700 text-white shadow-2xs font-bold'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                }`}
              >
                <span>Demos de Pruebas</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {accounts.filter(a => a.accountType === 'BROKER_DEMO').length}
                </span>
              </button>
            </div>
          </div>

          {/* Cards Grid of Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {accounts
              .filter(acc => accountFilter === 'ALL' || acc.accountType === accountFilter)
              .map(acc => {
                const isSelected = acc.id === currentActiveId;
                const benchmark = acc.calculationMode === 'TRAILING_EQUITY' ? acc.peakEquityToday : acc.initialCapital;
                const lossEur = benchmark - acc.currentEquity;
                const ddPct = lossEur > 0 ? Number(((lossEur / benchmark) * 100).toFixed(2)) : 0;
                const bufferToBreaker = Math.max(0, Number((acc.circuitBreakerThresholdPct - ddPct).toFixed(2)));

                return (
                  <div
                    key={acc.id}
                    className={`bg-white rounded-2xl border transition shadow-2xs flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Account Card Header */}
                    <div className="p-4 border-b border-slate-100 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs ${
                            acc.broker === 'FTMO' ? 'bg-gradient-to-br from-blue-600 to-indigo-800' :
                            acc.broker === 'FundedNext' ? 'bg-gradient-to-br from-purple-600 to-pink-700' :
                            acc.broker === 'Topstep' ? 'bg-gradient-to-br from-amber-600 to-orange-700' :
                            acc.broker === 'IC Markets' ? 'bg-gradient-to-br from-emerald-600 to-teal-800' :
                            'bg-gradient-to-br from-slate-700 to-slate-900'
                          }`}>
                            {acc.broker.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-900">{acc.name}</span>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                  <span>★ PRINCIPAL ACTIVA</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span>#{acc.accountNumber}</span>
                              <span>·</span>
                              <span>{acc.server}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status pill & toggle */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAccountActive(acc.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                              acc.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title={acc.isActive ? 'Pausar trading en esta cuenta' : 'Reanudar trading en esta cuenta'}
                          >
                            <span className={`w-2 h-2 rounded-full ${acc.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span>{acc.isActive ? 'OPERANDO' : 'PAUSADA'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Tags & Account Type */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.accountType === 'PROP_FIRM_EVAL' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          acc.accountType === 'PROP_FIRM_FUNDED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          acc.accountType === 'BROKER_REAL' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {acc.accountType === 'PROP_FIRM_EVAL' ? 'Reto de Evaluación' :
                           acc.accountType === 'PROP_FIRM_FUNDED' ? 'Fondeada Real (Profit Split)' :
                           acc.accountType === 'BROKER_REAL' ? 'Broker Capital Propio' :
                           'Demo de Laboratorio'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          {acc.calculationMode === 'TRAILING_EQUITY' ? 'Trailing Stop Intradía' : 'Balance-Based'}
                        </span>
                        {acc.tags.map((tag, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-50 text-slate-500 border border-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* 🛡️ Real-Time Floating Drawdown Gauge for this Account */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-amber-600" />
                            <span>Drawdown Flotante Actual:</span>
                            <span className="font-mono text-slate-900 font-bold">{ddPct > 0 ? `-${ddPct}%` : '0.0%'}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Breaker: {acc.circuitBreakerThresholdPct}% · Límite Fatal: {acc.dailyDrawdownLimitPct}%
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 relative overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              ddPct >= acc.circuitBreakerThresholdPct ? 'bg-rose-600' :
                              ddPct >= acc.warningThresholdPct ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (ddPct / acc.dailyDrawdownLimitPct) * 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span className="text-emerald-700 font-bold">
                            ✓ Margen de Supervivencia: {bufferToBreaker}% antes del freno preventivo
                          </span>
                          <span className="text-slate-400 font-mono">
                            {acc.calculationMode === 'TRAILING_EQUITY' ? 'Pico Hoy: ' + acc.currency + ' ' + acc.peakEquityToday : 'Cap. Base: ' + acc.currency + ' ' + acc.initialCapital}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Account Financials & Performance Grid */}
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Saldo Cerrado</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {acc.currency === 'USD' ? '$' : '€'}{acc.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Base: {acc.currency === 'USD' ? '$' : '€'}{acc.initialCapital.toLocaleString('es-ES')}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block">Equity Flotante</span>
                        <span className="font-mono font-bold text-emerald-800 text-sm flex items-center gap-1">
                          <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                          {acc.currency === 'USD' ? '$' : '€'}{acc.currentEquity.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] font-semibold ${acc.floatingPnlEur >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {acc.floatingPnlEur >= 0 ? '+' : ''}{acc.floatingPnlEur.toFixed(2)} {acc.currency}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">PnL Diario / Neto</span>
                        <span className={`font-mono font-bold text-sm ${acc.dailyPnlEur >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {acc.dailyPnlEur >= 0 ? '+' : ''}{acc.currency === 'USD' ? '$' : '€'}{acc.dailyPnlEur.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Neto: +{acc.currency === 'USD' ? '$' : '€'}{acc.netPnlEur.toFixed(0)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Calidad Broker</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {acc.avgSlippagePips} pips
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Win Rate: {acc.winRatePct}% ({acc.totalTrades}t)
                        </span>
                      </div>
                    </div>

                    {/* Account Actions Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!isSelected ? (
                          <button
                            type="button"
                            onClick={() => handleSwitchAccount(acc.id)}
                            disabled={isSwitchingAccount}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <span>Seleccionar como Principal</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Monitoreando en Pantalla</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAccount(acc);
                            setShowEditAccountModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                          title="Editar reglas y límites de esta cuenta"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {accounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                            title="Desvincular cuenta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* ─── DESPACHO SINCRONIZADO MULTI-BROKER (COPY-TRADING INSTITUCIONAL) ─── */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white p-5 rounded-2xl border border-slate-700 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      Despachador Sincronizado Multi-Broker (Copy-Trading Institucional)
                    </h3>
                    <p className="text-xs text-slate-300">
                      Envía una orden al instante calculando el lotaje matemático de forma proporcional en cada cuenta según su capital individual.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Activo Financiero:</label>
                <select
                  value={multiExecSymbol}
                  onChange={(e) => setMultiExecSymbol(e.target.value)}
                  className="w-full bg-slate-800 text-white text-xs font-semibold rounded-xl border border-slate-700 p-2.5 focus:ring-1 focus:ring-amber-500 outline-hidden"
                >
                  <option value="S&P 500 (VOO/ES)">S&P 500 (VOO/ES)</option>
                  <option value="XAUUSD (Oro)">XAUUSD (Oro)</option>
                  <option value="EURUSD">EURUSD</option>
                  <option value="NASDAQ (QQQ)">NASDAQ (QQQ)</option>
                  <option value="BTCUSD">BTCUSD</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Dirección de Entrada:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMultiExecDirection('BUY')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      multiExecDirection === 'BUY'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>COMPRA (BUY)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMultiExecDirection('SELL')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      multiExecDirection === 'SELL'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>VENTA (SELL)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Riesgo Idéntico por Cuenta (%):</label>
                <div className="flex items-center gap-2">
                  {[0.5, 0.75, 1.0, 1.5].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMultiExecRiskPct(pct)}
                      className={`flex-1 p-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                        multiExecRiskPct === pct
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Distribution Preview Table */}
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-700 space-y-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                ⚡ Vista Previa del Despacho Proporcional ({accounts.filter(a => a.isActive).length} cuentas activas)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                      <th className="pb-1.5">CUENTA / BROKER</th>
                      <th className="pb-1.5">TIPO</th>
                      <th className="pb-1.5">CAPITAL</th>
                      <th className="pb-1.5">RIESGO ({multiExecRiskPct}%)</th>
                      <th className="pb-1.5">LOTES CALCULADOS</th>
                      <th className="pb-1.5 text-right">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {accounts.map(acc => {
                      const estimatedRisk = (acc.balance * (multiExecRiskPct / 100));
                      // Estimated lot size based on symbol & balance
                      const estimatedLots = Number(Math.max(0.01, (acc.balance / 100000) * multiExecRiskPct * 0.8).toFixed(2));
                      return (
                        <tr key={acc.id} className="text-slate-200">
                          <td className="py-2 font-bold font-sans flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${acc.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            <span>{acc.name}</span>
                          </td>
                          <td className="py-2 text-[10px] text-slate-400">
                            {acc.accountType === 'PROP_FIRM_EVAL' ? 'Reto' : acc.accountType === 'PROP_FIRM_FUNDED' ? 'Fondeada' : acc.accountType === 'BROKER_REAL' ? 'Real' : 'Demo'}
                          </td>
                          <td className="py-2">{acc.currency === 'USD' ? '$' : '€'}{acc.balance.toLocaleString('es-ES')}</td>
                          <td className="py-2 text-amber-300 font-bold">{acc.currency === 'USD' ? '$' : '€'}{estimatedRisk.toFixed(2)}</td>
                          <td className="py-2 text-emerald-400 font-bold">{estimatedLots} lotes</td>
                          <td className="py-2 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                              acc.isActive ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {acc.isActive ? 'Listo para Recibir' : 'Pausada'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Execute multi-trade button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">
                🔒 Todas las posiciones quedarán bajo la vigilancia simultánea del Guardián de Floating Equity.
              </span>
              <button
                type="button"
                onClick={handleDispatchMultiAccountTrade}
                disabled={isDispatchingMulti}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Zap className={`w-4 h-4 ${isDispatchingMulti ? 'animate-spin' : ''}`} />
                <span>
                  {isDispatchingMulti ? 'Despachando a Servidores...' : `Despachar Orden Sincronizada a ${accounts.filter(a => a.isActive).length} Cuentas`}
                </span>
              </button>
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

      {/* ─── MODAL 1: VINCULAR NUEVA CUENTA DE BROKER / FONDEO ─── */}
      {showNewAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Vincular Nueva Cuenta de Trading</h3>
                  <p className="text-xs text-slate-500">Añade brokers reales, desafíos de fondeo o cuentas demo para operar en paralelo.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAccountModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                ⚡ Plantillas Rápidas Preconfiguradas:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyAccountPreset('FTMO_100K')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition cursor-pointer"
                >
                  FTMO $100k
                </button>
                <button
                  type="button"
                  onClick={() => applyAccountPreset('FUNDEDNEXT_50K')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition cursor-pointer"
                >
                  FundedNext €50k
                </button>
                <button
                  type="button"
                  onClick={() => applyAccountPreset('TOPSTEP_50K')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition cursor-pointer"
                >
                  Apex / Topstep $50k
                </button>
                <button
                  type="button"
                  onClick={() => applyAccountPreset('IC_MARKETS_DEMO')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition cursor-pointer"
                >
                  IC Markets Demo €10k
                </button>
                <button
                  type="button"
                  onClick={() => applyAccountPreset('IBKR_REAL')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition cursor-pointer"
                >
                  IBKR Real €25k
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Descriptivo:</label>
                  <input
                    type="text"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    required
                    placeholder="ej. FTMO Challenge $100k"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Broker / Firma:</label>
                  <input
                    type="text"
                    value={newAccBroker}
                    onChange={(e) => setNewAccBroker(e.target.value)}
                    required
                    placeholder="ej. FTMO, Topstep, Pepperstone"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Cuenta:</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as AccountType)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-amber-500 outline-hidden"
                  >
                    <option value="PROP_FIRM_EVAL">Reto Evaluación (Fase 1/2)</option>
                    <option value="PROP_FIRM_FUNDED">Fondeada Real (Funded)</option>
                    <option value="BROKER_REAL">Broker Real (Capital Propio)</option>
                    <option value="BROKER_DEMO">Cuenta Demo (Laboratorio)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Moneda Base:</label>
                  <select
                    value={newAccCurrency}
                    onChange={(e) => setNewAccCurrency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-amber-500 outline-hidden"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Capital Inicial:</label>
                  <input
                    type="number"
                    value={newAccInitialCap}
                    onChange={(e) => setNewAccInitialCap(Number(e.target.value))}
                    required
                    min={100}
                    step={1000}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Prop Firm Safeguards Section */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Reglas de Riesgo & Guardián de Fondeo</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Límite Diario Fatal (%):</label>
                    <input
                      type="number"
                      value={newAccDailyLimit}
                      onChange={(e) => setNewAccDailyLimit(Number(e.target.value))}
                      step={0.1}
                      min={1}
                      max={20}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-rose-700 outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">Pérdida donde suspenden</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Circuit Breaker IA (%):</label>
                    <input
                      type="number"
                      value={newAccBreaker}
                      onChange={(e) => setNewAccBreaker(Number(e.target.value))}
                      step={0.1}
                      min={0.5}
                      max={15}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-amber-700 outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500">Liquidación preventiva</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Cálculo de Drawdown:</label>
                    <select
                      value={newAccCalcMode}
                      onChange={(e) => setNewAccCalcMode(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium outline-hidden"
                    >
                      <option value="BALANCE_BASED">Balance-Based (FTMO/FundedNext)</option>
                      <option value="TRAILING_EQUITY">Trailing Stop (Apex/Topstep)</option>
                    </select>
                    <span className="text-[10px] text-slate-500">Regla de la empresa</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Servidor (Broker / Gateway):</label>
                  <input
                    type="text"
                    value={newAccServer}
                    onChange={(e) => setNewAccServer(e.target.value)}
                    placeholder="ej. FTMO-Live2 o ICMarkets-Live02"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número de Cuenta / Login:</label>
                  <input
                    type="text"
                    value={newAccNumber}
                    onChange={(e) => setNewAccNumber(e.target.value)}
                    placeholder="ej. 8891024"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewAccountModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAccount}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingAccount ? 'Vinculando...' : 'Vincular y Comenzar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: EDITAR PARÁMETROS DE CUENTA ─── */}
      {showEditAccountModal && editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Editar Reglas de {editingAccount.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditAccountModal(false);
                  setEditingAccount(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de la Cuenta:</label>
                <input
                  type="text"
                  value={editingAccount.name}
                  onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Límite Drawdown Diario (%):</label>
                  <input
                    type="number"
                    step={0.1}
                    value={editingAccount.dailyDrawdownLimitPct}
                    onChange={(e) => setEditingAccount({ ...editingAccount, dailyDrawdownLimitPct: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-rose-700 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Circuit Breaker IA (%):</label>
                  <input
                    type="number"
                    step={0.1}
                    value={editingAccount.circuitBreakerThresholdPct}
                    onChange={(e) => setEditingAccount({ ...editingAccount, circuitBreakerThresholdPct: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-amber-700 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Modo de Cálculo:</label>
                  <select
                    value={editingAccount.calculationMode}
                    onChange={(e) => setEditingAccount({ ...editingAccount, calculationMode: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-hidden"
                  >
                    <option value="BALANCE_BASED">Balance-Based</option>
                    <option value="TRAILING_EQUITY">Trailing Equity Intradía</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Riesgo Máx por Trade (%):</label>
                  <input
                    type="number"
                    step={0.1}
                    value={editingAccount.maxRiskPerTradePct}
                    onChange={(e) => setEditingAccount({ ...editingAccount, maxRiskPerTradePct: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditAccountModal(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: AÑADIR NUEVO TICKER / SÍMBOLO AL ESCÁNER CLOUD ─── */}
      {showAddTickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Añadir Símbolo al Escáner Cloud</h3>
                  <p className="text-xs text-slate-500">Registra un nuevo activo para que el bot lo monitoree 24/7 en segundo plano.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTickerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicker} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ticker / Símbolo (ej: GBPUSD, US30, ETHUSD):</label>
                <input
                  type="text"
                  required
                  placeholder="GBPUSD"
                  value={newTickerSymbol}
                  onChange={(e) => setNewTickerSymbol(e.target.value)}
                  className="w-full uppercase font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Descriptivo:</label>
                <input
                  type="text"
                  placeholder="Libra / Dólar Forex"
                  value={newTickerDisplayName}
                  onChange={(e) => setNewTickerDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoría del Mercado:</label>
                <select
                  value={newTickerCategory}
                  onChange={(e) => setNewTickerCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="FOREX">Forex (Divisas)</option>
                  <option value="INDICE">Índices Bursátiles</option>
                  <option value="COMMODITY">Commodities (Materias Primas / Oro)</option>
                  <option value="CRYPTO">Criptomonedas</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de la Primera Estrategia:</label>
                <input
                  type="text"
                  value={newTickerInitialStrat}
                  onChange={(e) => setNewTickerInitialStrat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 text-[11px]">
                ℹ️ Al guardarlo, el bot creará automáticamente las reglas técnicas de barrido de liquidez, colchón anti-mechazos inicial de 5.0 pips y comenzará a escanear en cada ciclo de 4 segundos.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTickerModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAddingTicker}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition shadow-sm flex items-center gap-1.5"
                >
                  {isAddingTicker ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAddingTicker ? 'Registrando...' : 'Registrar Símbolo en la Nube'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: DISPARO INMEDIATO DE ESTRATEGIA EN LA NUBE ─── */}
      {showInstantExecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Disparo Inmediato de Orden</h3>
                  <p className="text-xs text-slate-500">Ejecuta una orden al instante en el servidor cloud con la estrategia elegida.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstantExecModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Ticker Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">1. Seleccionar Ticket / Símbolo:</label>
                <select
                  value={instantExecSymbol}
                  onChange={(e) => {
                    const sym = e.target.value;
                    setInstantExecSymbol(sym);
                    const t = tickerConfigs.find(tc => tc.symbol === sym);
                    if (t && t.strategies.length > 0) {
                      setInstantExecStrategyId(t.strategies[0].id);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  {tickerConfigs.map(t => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} — {t.displayName} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Strategy Selector for chosen ticker */}
              {(() => {
                const chosenTicker = tickerConfigs.find(t => t.symbol === instantExecSymbol);
                const strats = chosenTicker?.strategies || [];
                return (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">2. Seleccionar Estrategia a Aplicar:</label>
                    <select
                      value={instantExecStrategyId}
                      onChange={(e) => setInstantExecStrategyId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    >
                      {strats.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.strategyName} ({s.timeframe} · {s.category})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              {/* Direction Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">3. Dirección de la Entrada:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInstantExecDirection('BUY')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      instantExecDirection === 'BUY'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>BUY (Largo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstantExecDirection('SELL')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      instantExecDirection === 'SELL'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>SELL (Corto)</span>
                  </button>
                </div>
              </div>

              {/* Risk Percentage */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">4. Riesgo por Operación (% de la cuenta):</label>
                  <span className="font-mono font-bold text-amber-700 text-sm">{instantExecRisk}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.25"
                    max="2.5"
                    step="0.25"
                    value={instantExecRisk}
                    onChange={(e) => setInstantExecRisk(Number(e.target.value))}
                    className="flex-1 accent-amber-600"
                  />
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {[0.5, 1.0, 1.5].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setInstantExecRisk(pct)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          instantExecRisk === pct ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Sizing Preview Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Cálculo Algorítmico Dinámico:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Cuenta:</span>
                    <span className="font-bold text-slate-800">{activeAccount?.name || 'Cuenta Primaria'} ({activeAccount?.broker})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Capital Base:</span>
                    <span className="font-bold font-mono text-slate-800">{activeAccount?.currency === 'USD' ? '$' : '€'}{(activeAccount?.balance ?? balance).toLocaleString('es-ES')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pérdida Máx en SL:</span>
                    <span className="font-bold font-mono text-rose-600">
                      -{activeAccount?.currency === 'USD' ? '$' : '€'}{(((activeAccount?.balance ?? balance) * instantExecRisk) / 100).toFixed(2)} ({instantExecRisk}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Protección Sentinel:</span>
                    <span className="font-bold text-emerald-700">Kill Switch Activo</span>
                  </div>
                </div>
              </div>

              {/* Execution Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInstantExecModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteStrategyDirectly(instantExecSymbol, instantExecStrategyId, instantExecDirection, instantExecRisk)}
                  disabled={isExecutingStrategyTrade}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Zap className={`w-3.5 h-3.5 ${isExecutingStrategyTrade ? 'animate-spin' : ''}`} />
                  <span>{isExecutingStrategyTrade ? 'Despachando a Servidor...' : '⚡ Ejecutar Orden en la Nube Ahora'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

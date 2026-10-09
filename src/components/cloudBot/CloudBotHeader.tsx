import React from 'react';
import { 
  Cloud, 
  Play, 
  Pause, 
  RefreshCw, 
  Wifi, 
  ShieldAlert, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Target, 
  ShieldCheck, 
  BookOpen, 
  Calculator, 
  Dna, 
  Radio
} from 'lucide-react';
import { CloudBotState, TradingAccount } from '../../types/cloudBot';
import { CloudBotTab } from '../../hooks/useCloudBot';

interface CloudBotHeaderProps {
  botState: CloudBotState | null;
  activeAccount: TradingAccount | undefined;
  activeTab: CloudBotTab;
  setActiveTab: (tab: CloudBotTab) => void;
  isSyncing: boolean;
  onToggleBot: () => void;
  onSyncBalance: () => void;
  onOpenConnectModal: () => void;
}

export const CloudBotHeader: React.FC<CloudBotHeaderProps> = ({
  botState,
  activeAccount,
  activeTab,
  setActiveTab,
  isSyncing,
  onToggleBot,
  onSyncBalance,
  onOpenConnectModal
}) => {
  const isRunning = botState?.isRunning ?? false;
  const isDrawdownLocked = botState?.isDrawdownLocked || botState?.circuitBreakerTripped;
  const floatingPnl = activeAccount ? activeAccount.floatingPnlEur : (botState?.floatingPnlEur ?? 0);
  const isFloatingPositive = floatingPnl >= 0;

  const currentBalance = activeAccount ? activeAccount.balance : (botState?.accountBalance ?? 10000);
  const currentEquity = activeAccount ? activeAccount.currentEquity : (botState?.currentEquity ?? 10000);
  const ping = activeAccount?.pingMs ?? 14;
  const currencySymbol = activeAccount?.currency === 'USD' ? '$' : '€';

  const accountsCount = botState?.accounts?.length ?? 1;
  const activeOrdersCount = botState?.activeOrders?.length ?? 0;
  const activeTickersCount = botState?.tickerConfigs?.filter(t => t.isActive).length ?? 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isRunning ? 'bg-emerald-500' : 'bg-amber-500'
        }`} 
      />

      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${
            isRunning 
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-950/50' 
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}>
            <Cloud className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Mando Autónomo Institucional 24/7
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isRunning
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {isRunning ? 'MOTOR OPERANDO 24/7' : 'EN ESPERA / PAUSADO'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Operación algorítmica autónoma · Conexión directa MetaTrader 5 Bridge · Sincronización en tiempo real
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Quick Broker Sync Button */}
          <button
            type="button"
            onClick={onSyncBalance}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Sincronizar saldo y equidad en vivo con el servidor MT5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Saldo MT5'}</span>
          </button>

          {/* Connect Account Modal Trigger */}
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/40 rounded-xl text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Vincular Cuenta MT5</span>
          </button>

          {/* Master 24/7 Switch */}
          <button
            type="button"
            onClick={onToggleBot}
            disabled={isDrawdownLocked}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg active:scale-95 ${
              isDrawdownLocked
                ? 'bg-rose-900/60 border border-rose-700 text-rose-300 cursor-not-allowed'
                : isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pausar Motor</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar 24/7</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Telemetry & Account Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 my-5 relative z-10">
        {/* Active Account Info */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cuenta Activa</span>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded text-slate-300">
              {activeAccount?.platform === 'MT5_DEMO' ? 'MT5 Demo' : 'MT5 Real'}
            </span>
          </div>
          <div className="font-semibold text-white truncate text-sm" title={activeAccount?.name || 'MT5 Demo'}>
            {activeAccount?.name || 'IC Markets Demo €10k'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            {activeAccount?.server || 'MetaQuotes-Demo'} · #{activeAccount?.accountNumber || '51294821'}
          </div>
        </div>

        {/* Live Detected Balance */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
            <span>Balance Broker</span>
            <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
          </div>
          <div className="font-bold text-white text-base sm:text-lg tracking-tight font-mono">
            {currencySymbol}{currentBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Margen libre: {currencySymbol}{(activeAccount?.freeMargin ?? currentBalance).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Real-time Equity & Floating PnL */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <div className="text-slate-400 text-xs mb-1">Equidad Flotante</div>
          <div className="font-bold text-white text-base sm:text-lg tracking-tight font-mono">
            {currencySymbol}{currentEquity.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-[11px] font-semibold mt-0.5 flex items-center gap-1 ${
            isFloatingPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isFloatingPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {isFloatingPositive ? '+' : ''}{currencySymbol}{floatingPnl.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Daily Drawdown & Guardian */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>DD Diario Límite</span>
            <span className="text-[10px] text-amber-400 font-medium">Auto</span>
          </div>
          <div className="font-bold text-white text-base sm:text-lg font-mono">
            {activeAccount?.dailyDrawdownLimitPct ?? 4.0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            Límite: {currencySymbol}{(((currentBalance * (activeAccount?.dailyDrawdownLimitPct ?? 4.0)) / 100)).toFixed(0)}
          </div>
        </div>

        {/* Total Drawdown Limit */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>DD Máximo Total</span>
            <span className="text-[10px] text-blue-400 font-medium">Fondeo</span>
          </div>
          <div className="font-bold text-white text-base sm:text-lg font-mono">
            {activeAccount?.totalDrawdownLimitPct ?? 8.0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            Límite: {currencySymbol}{(((currentBalance * (activeAccount?.totalDrawdownLimitPct ?? 8.0)) / 100)).toFixed(0)}
          </div>
        </div>

        {/* MT5 Telemetry & Latency */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Latencia MT5</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-bold text-emerald-400 text-base sm:text-lg font-mono">
            {ping} ms
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            Ticks hoy: {(botState?.ticksProcessedToday ?? 1420).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Safety Alert Banner if Circuit Breaker Tripped */}
      {isDrawdownLocked && (
        <div className="mb-4 p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl flex items-center justify-between gap-3 text-rose-200 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-rose-300">PROTECCIÓN CIRCUIT BREAKER ACTIVA:</span> Operaciones detenidas para salvaguardar la cuenta ({botState?.circuitBreakerReason || 'Pérdida flotante superó el umbral preventivo'}).
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-800/80 pt-4 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('strategies_hub')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 ${
            activeTab === 'strategies_hub'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Estrategias & Tickers</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'strategies_hub' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-700 text-slate-300'
          }`}>
            {activeTickersCount} activos
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('accounts_hub')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 ${
            activeTab === 'accounts_hub'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Cuentas & MetaTrader 5</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'accounts_hub' ? 'bg-blue-800 text-blue-100' : 'bg-slate-700 text-slate-300'
          }`}>
            {accountsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active_orders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 ${
            activeTab === 'active_orders'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Órdenes en Vivo</span>
          {activeOrdersCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-800 text-purple-100 font-bold animate-pulse">
              {activeOrdersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('equity_sentinel')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 ${
            activeTab === 'equity_sentinel'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Centinela & Drawdown</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 ${
            activeTab === 'journal'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Diario & Post-Mortem</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 ${
            activeTab === 'calculator'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculadora Anti-Caza</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evolution')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 ${
            activeTab === 'evolution'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Dna className="w-3.5 h-3.5" />
          <span>Calibración Evolutiva</span>
        </button>
      </div>
    </div>
  );
};

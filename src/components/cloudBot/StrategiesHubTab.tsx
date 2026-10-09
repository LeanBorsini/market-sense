import React, { useState } from 'react';
import { 
  Target, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Flame, 
  ShieldAlert, 
  TrendingUp, 
  Play, 
  Terminal, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Info
} from 'lucide-react';
import { CloudBotState, TickerTradingConfig, BotStrategyConfig } from '../../types/cloudBot';

interface StrategiesHubTabProps {
  botState: CloudBotState | null;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onToggleTicker: (symbol: string) => void;
  onToggleStrategy: (symbol: string, strategyId: string) => void;
  onSetTickerMode: (symbol: string, mode: 'ANY_TRIGGERS' | 'CONFLUENCE_ALL') => void;
  onExecuteStrategy: (symbol: string, strategyId?: string, direction?: 'BUY' | 'SELL') => void;
  onForceScan: () => void;
}

export const StrategiesHubTab: React.FC<StrategiesHubTabProps> = ({
  botState,
  selectedSymbol,
  onSelectSymbol,
  onToggleTicker,
  onToggleStrategy,
  onSetTickerMode,
  onExecuteStrategy,
  onForceScan
}) => {
  const [isExecutingTest, setIsExecutingTest] = useState<string | null>(null);

  const tickerConfigs = botState?.tickerConfigs || [];
  const currentTicker = tickerConfigs.find(t => t.symbol === selectedSymbol) || tickerConfigs[0];
  const scannerLogs = botState?.scannerLogs || [];

  const handleTestTrigger = async (strategyId?: string, direction?: 'BUY' | 'SELL') => {
    if (!currentTicker) return;
    setIsExecutingTest(strategyId || 'direct');
    try {
      await onExecuteStrategy(currentTicker.symbol, strategyId, direction || 'BUY');
    } finally {
      setIsExecutingTest(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Guidance Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Selección de Activos & Configuración de Estrategias Autónomas</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Control Operativo
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Elige el ticket (activo) a operar en la barra superior. Puedes habilitar una o varias estrategias simultáneas y configurar si el bot debe entrar cuando <strong className="text-emerald-300">cualquiera de ellas dé señal</strong> o cuando exista <strong className="text-emerald-300">confluencia total</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Ticker Selection Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            1. Selecciona el Ticket a Operar:
          </span>
          <span className="text-xs text-slate-400">
            {tickerConfigs.filter(t => t.isActive).length} de {tickerConfigs.length} activos con escaneo activo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {tickerConfigs.map((ticker) => {
            const isSelected = ticker.symbol === selectedSymbol;
            const enabledCount = ticker.strategies.filter(s => s.isEnabled).length;

            return (
              <button
                key={ticker.symbol}
                type="button"
                onClick={() => onSelectSymbol(ticker.symbol)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-emerald-950/70 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {ticker.symbol}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${ticker.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {ticker.displayName}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{ticker.category}</span>
                  <span className={`px-1.5 py-0.2 rounded font-medium ${
                    enabledCount > 0 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {enabledCount} strat{enabledCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Ticker Configuration Desk */}
      {currentTicker && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
          {/* Header of Selected Ticker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{currentTicker.symbol}</span>
                  <span className="text-sm font-normal text-slate-400">({currentTicker.displayName})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => onToggleTicker(currentTicker.symbol)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    currentTicker.isActive
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {currentTicker.isActive ? 'Activo en Escáner' : 'Pausado'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Categoría: {currentTicker.category} · Límite simultáneo: {currentTicker.maxConcurrentTrades || 1} operación abierta
              </p>
            </div>

            {/* Trigger Mode Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80">
              <span className="text-xs text-slate-400 px-2 font-medium">Modo de Activación:</span>
              <button
                type="button"
                onClick={() => onSetTickerMode(currentTicker.symbol, 'ANY_TRIGGERS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTicker.triggerMode === 'ANY_TRIGGERS'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Si cualquiera de las estrategias activas detecta condiciones, ejecuta inmediatamente"
              >
                ⚡ Si CUALQUIERA se cumple
              </button>
              <button
                type="button"
                onClick={() => onSetTickerMode(currentTicker.symbol, 'CONFLUENCE_ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTicker.triggerMode === 'CONFLUENCE_ALL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Requiere que todas las estrategias activas coincidan al mismo tiempo"
              >
                🎯 Confluencia Total
              </button>
            </div>
          </div>

          {/* Strategies List for this Ticker */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                2. Estrategias Aplicables a {currentTicker.symbol}:
              </span>
              <span className="text-xs text-slate-400">
                Activa las casillas para que el algoritmo busque estas configuraciones en vivo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentTicker.strategies.map((strat) => {
                const isExecutingThis = isExecutingTest === strat.id;

                return (
                  <div 
                    key={strat.id}
                    className={`p-4 rounded-xl border transition-all ${
                      strat.isEnabled
                        ? 'bg-slate-800/70 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-800/30 border-slate-700/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Strategy Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm sm:text-base">
                            {strat.strategyName}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            strat.direction === 'BUY'
                              ? 'bg-emerald-950 text-emerald-300'
                              : strat.direction === 'SELL'
                              ? 'bg-rose-950 text-rose-300'
                              : 'bg-blue-950 text-blue-300'
                          }`}>
                            {strat.direction}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>TF: {strat.timeframe}</span>
                          <span>·</span>
                          <span>Riesgo: {strat.riskPercent}%</span>
                          <span>·</span>
                          <span className="text-emerald-400">Colchón: +{strat.antiHuntCushionPips} pips</span>
                        </div>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => onToggleStrategy(currentTicker.symbol, strat.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                          strat.isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                        title={strat.isEnabled ? 'Pausar estrategia' : 'Activar estrategia'}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          strat.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Rules Checklist */}
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2 mb-3">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Condiciones Cuantitativas de Entrada:
                      </div>
                      <div className="space-y-1.5">
                        {strat.rules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              {rule.isMet ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                              )}
                              <span>{rule.name}</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {rule.currentValue || (rule.isMet ? 'Cumplida' : 'Evaluando')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strategy Status & Test Execution Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          strat.isEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                        }`} />
                        <span className="text-xs text-slate-400">
                          {strat.isEnabled ? 'Escaneando ticks en vivo...' : 'Inactiva'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTestTrigger(strat.id, strat.direction === 'SELL' ? 'SELL' : 'BUY')}
                        disabled={isExecutingThis || !strat.isEnabled}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg text-xs font-medium transition-all disabled:opacity-40 active:scale-95"
                        title="Simular disparo de esta estrategia para probar la ejecución inmediata en la cuenta"
                      >
                        <Zap className="w-3 h-3 text-blue-400" />
                        <span>{isExecutingThis ? 'Enviando orden...' : 'Test de Ejecución'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Scanner Live Telemetry Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              Consola del Escáner Institucional 24/7 (Logs en Vivo)
            </h3>
          </div>

          <button
            type="button"
            onClick={onForceScan}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-medium transition-all active:scale-95"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Forzar Escaneo Ahora</span>
          </button>
        </div>

        {/* Streaming Logs Box */}
        <div className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto space-y-2">
          {scannerLogs.length === 0 ? (
            <div className="text-slate-500 italic text-center py-4">
              Escuchando señales del mercado... El bot revisa las condiciones cada 3-4 segundos.
            </div>
          ) : (
            scannerLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/50 p-1 rounded">
                <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                  log.type === 'TRIGGER' || log.type === 'EXECUTION'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : log.type === 'WARNING'
                    ? 'bg-rose-950 text-rose-300'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {log.type}
                </span>
                <span className="text-blue-400 font-bold shrink-0">[{log.symbol}]</span>
                <span className="text-slate-300 flex-1">{log.message}</span>
                {log.latencyMs && (
                  <span className="text-[10px] text-slate-500 shrink-0">{log.latencyMs}ms</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

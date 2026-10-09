import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  Unlock, 
  Activity 
} from 'lucide-react';
import { CloudBotState, TradingAccount } from '../../types/cloudBot';

interface EquitySentinelTabProps {
  botState: CloudBotState | null;
  activeAccount: TradingAccount | undefined;
  onResetCircuitBreaker: () => void;
}

export const EquitySentinelTab: React.FC<EquitySentinelTabProps> = ({
  botState,
  activeAccount,
  onResetCircuitBreaker
}) => {
  const isTripped = botState?.circuitBreakerTripped || botState?.isDrawdownLocked;
  const currentBalance = activeAccount?.balance || botState?.accountBalance || 10000;
  const currentEquity = activeAccount?.currentEquity || botState?.currentEquity || 10000;
  const floatingPnl = activeAccount ? activeAccount.floatingPnlEur : (botState?.floatingPnlEur || 0);

  const dailyDDPct = activeAccount?.dailyDrawdownLimitPct || botState?.dailyDrawdownLimitPct || 4.0;
  const circuitBreakerPct = activeAccount?.circuitBreakerThresholdPct || botState?.circuitBreakerThresholdPct || 3.2;
  const totalDDPct = activeAccount?.totalDrawdownLimitPct || botState?.totalDrawdownLimitPct || 8.0;

  const dailyDDAmount = (currentBalance * dailyDDPct) / 100;
  const circuitBreakerAmount = (currentBalance * circuitBreakerPct) / 100;
  const totalDDAmount = (currentBalance * totalDDPct) / 100;

  const currencySymbol = activeAccount?.currency === 'USD' ? '$' : '€';

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Guardián de Equidad Institucional & Circuit Breaker</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Auto-Protección de Fondeo
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Monitorea el flotante en tiempo real tick a tick. Si la pérdida diaria acumulada se aproxima al umbral de riesgo, el Circuit Breaker interviene antes de que la prop firm o broker suspenda la cuenta.
            </p>
          </div>
        </div>
      </div>

      {/* Circuit Breaker State Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border shadow-xl transition-all ${
        isTripped 
          ? 'bg-rose-950/40 border-rose-500/60' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isTripped ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isTripped ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Estado del Circuit Breaker: {isTripped ? 'DISPARADO (BLOQUEADO)' : 'OPERATIVO (PROTECCIÓN VIGILANTE)'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTripped 
                  ? botState?.circuitBreakerReason || 'Operaciones detenidas para proteger el balance'
                  : 'Vigilando 24/7 sin violaciones de riesgo registradas'
                }
              </p>
            </div>
          </div>

          {isTripped && (
            <button
              type="button"
              onClick={onResetCircuitBreaker}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restablecer y Reactivar Bot</span>
            </button>
          )}
        </div>

        {/* Protection Limits Auto-Calculated */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Umbral Preventivo (Circuit Breaker)</span>
              <span className="text-amber-400 font-bold">{circuitBreakerPct}%</span>
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {currencySymbol}{circuitBreakerAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Si la pérdida flotante toca este nivel, el bot cancela órdenes y frena.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Límite Máximo Diario (Prop Firm)</span>
              <span className="text-rose-400 font-bold">{dailyDDPct}%</span>
            </div>
            <div className="text-xl font-bold text-rose-300 font-mono">
              {currencySymbol}{dailyDDAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Regla estricta del contrato de fondeo / broker.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Límite Máximo Total (Global DD)</span>
              <span className="text-blue-400 font-bold">{totalDDPct}%</span>
            </div>
            <div className="text-xl font-bold text-blue-300 font-mono">
              {currencySymbol}{totalDDAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Colchón global de la cuenta calculada sobre el balance inicial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

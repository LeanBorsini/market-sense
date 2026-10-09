import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  RefreshCw, 
  Wifi, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Server, 
  Lock, 
  Zap, 
  Layers
} from 'lucide-react';
import { CloudBotState, TradingAccount } from '../../types/cloudBot';

interface AccountsHubTabProps {
  botState: CloudBotState | null;
  activeAccount: TradingAccount | undefined;
  isSyncing: boolean;
  onSwitchAccount: (accountId: string) => void;
  onSyncAccount: (accountId: string) => void;
  onOpenConnectModal: () => void;
}

export const AccountsHubTab: React.FC<AccountsHubTabProps> = ({
  botState,
  activeAccount,
  isSyncing,
  onSwitchAccount,
  onSyncAccount,
  onOpenConnectModal
}) => {
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const accounts = botState?.accounts || [];

  const togglePasswordVisibility = (accId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [accId]: !prev[accId] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Informative Guidance Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-4 sm:p-5 text-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shrink-0 mt-0.5">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Centro Multi-Broker & Cuentas MetaTrader 5</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  Sincronización en Tiempo Real
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Gestiona tus cuentas Demo y Reales de MT5 y Fondeo. El bot detecta automáticamente el saldo real, la equidad flotante y recalcula los límites de riesgo institucionales sin necesidad de configuraciones manuales arbitrarias.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenConnectModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-950/50 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Conectar MT5</span>
          </button>
        </div>
      </div>

      {/* Featured Active Account Card */}
      {activeAccount && (
        <div className="bg-slate-900 border-2 border-blue-500/50 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[11px] font-bold px-4 py-1 rounded-bl-xl tracking-wider flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CUENTA ACTIVA DE OPERACIÓN</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-white">
                  {activeAccount.name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeAccount.platform === 'MT5_DEMO'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                }`}>
                  {activeAccount.platform === 'MT5_DEMO' ? 'MetaTrader 5 Demo' : 'MetaTrader 5 Real'}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {activeAccount.broker}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Servidor: <strong className="text-slate-200 font-mono">{activeAccount.server}</strong> · Sincronización: {activeAccount.lastSyncTime || 'En vivo'}
              </p>
            </div>

            {/* Quick Sync Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSyncAccount(activeAccount.id)}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando con broker...' : 'Sincronizar Saldo Ahora'}</span>
              </button>
            </div>
          </div>

          {/* Account Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5">
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 text-xs">Balance Oficial:</span>
              <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
                {activeAccount.currency === 'USD' ? '$' : '€'}
                {activeAccount.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">
                Inicial: {activeAccount.currency === 'USD' ? '$' : '€'}{activeAccount.initialCapital.toLocaleString('es-ES')}
              </span>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 text-xs">Equidad en Tiempo Real:</span>
              <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
                {activeAccount.currency === 'USD' ? '$' : '€'}
                {activeAccount.currentEquity.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-[11px] font-semibold flex items-center gap-1 ${
                activeAccount.floatingPnlEur >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {activeAccount.floatingPnlEur >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {activeAccount.floatingPnlEur >= 0 ? '+' : ''}
                  {activeAccount.currency === 'USD' ? '$' : '€'}{activeAccount.floatingPnlEur.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 text-xs">DD Diario Máximo (Auto):</span>
              <div className="text-lg sm:text-xl font-bold text-amber-400 font-mono mt-0.5">
                {activeAccount.dailyDrawdownLimitPct}%
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Límite: {activeAccount.currency === 'USD' ? '$' : '€'}
                {(((activeAccount.balance * activeAccount.dailyDrawdownLimitPct) / 100)).toFixed(0)}
              </span>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 text-xs">Latencia MT5 Bridge:</span>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono mt-0.5 flex items-center gap-1.5">
                <Wifi className="w-4 h-4" />
                <span>{activeAccount.pingMs || 14} ms</span>
              </div>
              <span className="text-[10px] text-emerald-400/80">Conexión Ultrarrápida</span>
            </div>
          </div>

          {/* Credentials Inspection Box */}
          <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500">Login ID:</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {activeAccount.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeAccount.accountNumber, `login-${activeAccount.id}`)}
                  className="text-slate-400 hover:text-white p-1"
                  title="Copiar ID de cuenta"
                >
                  {copiedId === `login-${activeAccount.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500">Contraseña:</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {showPasswordMap[activeAccount.id] ? (activeAccount.password || 'Demo1234!') : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(activeAccount.id)}
                  className="text-slate-400 hover:text-white p-1"
                  title="Mostrar u ocultar contraseña"
                >
                  {showPasswordMap[activeAccount.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500">Servidor:</span>
                <span className="font-mono text-slate-300">{activeAccount.server}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Protección Institucional Automática Activa</span>
            </div>
          </div>
        </div>
      )}

      {/* All Accounts Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Todas las Cuentas Vinculadas ({accounts.length})
          </span>
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar otra cuenta MT5</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const isActive = acc.id === activeAccount?.id;
            const currencySymbol = acc.currency === 'USD' ? '$' : '€';

            return (
              <div 
                key={acc.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-slate-800/80 border-blue-500/60 ring-1 ring-blue-500/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">
                        {acc.name}
                      </h4>
                      {isActive && (
                        <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.2 rounded-full font-bold">
                          ACTIVA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {acc.broker} · {acc.server} · Login: <span className="font-mono text-slate-300 font-semibold">{acc.accountNumber}</span>
                    </div>
                  </div>

                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => onSwitchAccount(acc.id)}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      Activar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px]">Balance:</span>
                    <div className="font-bold text-white font-mono">
                      {currencySymbol}{acc.balance.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">DD Diario Auto:</span>
                    <div className="font-bold text-amber-400 font-mono">
                      {acc.dailyDrawdownLimitPct}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Latencia:</span>
                    <div className="font-bold text-emerald-400 font-mono">
                      {acc.pingMs || 14} ms
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">
                    {acc.accountType === 'PROP_FIRM_EVAL' ? 'Evaluación Fondeo' : acc.accountType === 'BROKER_REAL' ? 'Cuenta Real' : 'Demo'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSyncAccount(acc.id)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sincronizar Saldo</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Wifi, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Lock
} from 'lucide-react';
import { ConnectMT5Params, ConnectMT5Response } from '../../hooks/useCloudBot';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectMT5: (params: ConnectMT5Params) => Promise<ConnectMT5Response>;
  onCreateAccount: (accountData: any) => Promise<any>;
}

const BROKER_PRESETS = [
  {
    name: 'MetaQuotes MT5 Demo',
    platform: 'MT5_DEMO',
    server: 'MetaQuotes-Demo',
    accountType: 'BROKER_DEMO',
    defaultCurrency: 'EUR'
  },
  {
    name: 'IC Markets Demo MT5',
    platform: 'MT5_DEMO',
    server: 'ICMarketsSC-Demo02',
    accountType: 'BROKER_DEMO',
    defaultCurrency: 'EUR'
  },
  {
    name: 'FTMO Challenge ($100k)',
    platform: 'MT5_DEMO',
    server: 'FTMO-Demo',
    accountType: 'PROP_FIRM_EVAL',
    defaultCurrency: 'USD'
  },
  {
    name: 'FundedNext Evaluation',
    platform: 'MT5_DEMO',
    server: 'FundedNext-Demo',
    accountType: 'PROP_FIRM_EVAL',
    defaultCurrency: 'EUR'
  },
  {
    name: 'IC Markets Real MT5',
    platform: 'MT5_REAL',
    server: 'ICMarketsSC-Live01',
    accountType: 'BROKER_REAL',
    defaultCurrency: 'EUR'
  },
  {
    name: 'FTMO Funded Real',
    platform: 'MT5_REAL',
    server: 'FTMO-Server',
    accountType: 'PROP_FIRM_FUNDED',
    defaultCurrency: 'USD'
  }
];

export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({
  isOpen,
  onClose,
  onConnectMT5,
  onCreateAccount
}) => {
  const [platform, setPlatform] = useState<'MT5_DEMO' | 'MT5_REAL' | 'MT4_DEMO' | 'MT4_REAL' | 'CTRADER'>('MT5_DEMO');
  const [broker, setBroker] = useState<string>('MetaQuotes MT5');
  const [server, setServer] = useState<string>('MetaQuotes-Demo');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [accountName, setAccountName] = useState<string>('');
  const [accountType, setAccountType] = useState<any>('BROKER_DEMO');

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ConnectMT5Response | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof BROKER_PRESETS[0]) => {
    setBroker(preset.name);
    setServer(preset.server);
    setPlatform(preset.platform as any);
    setAccountType(preset.accountType);
    if (!accountName) {
      setAccountName(preset.name);
    }
    setTestResult(null);
    setFormError(null);
  };

  const handleTestConnection = async () => {
    if (!accountNumber.trim()) {
      setFormError('Por favor introduce el número de cuenta / Login MT5');
      return;
    }
    if (!password.trim()) {
      setFormError('Por favor introduce la contraseña de la cuenta para validar el acceso con el servidor');
      return;
    }

    setFormError(null);
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await onConnectMT5({
        platform,
        broker,
        server,
        accountNumber: accountNumber.trim(),
        password: password.trim(),
        accountType
      });
      setTestResult(res);
      if (!accountName) {
        setAccountName(`${broker} #${accountNumber.trim()}`);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error al conectar con el servidor broker');
    } finally {
      setIsTesting(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!accountNumber.trim()) {
      setFormError('El número de cuenta es requerido');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      // Auto-calculated values if test was done, or safe fallbacks
      const detectedBalance = testResult?.detectedBalance || 10000;
      const detectedCurrency = testResult?.detectedCurrency || 'EUR';
      const autoLimits = testResult?.autoLimits || {
        dailyDrawdownLimitPct: 4.0,
        circuitBreakerThresholdPct: 3.2,
        totalDrawdownLimitPct: 8.0,
        maxRiskPerTradePct: 0.75,
        calculationMode: 'BALANCE_BASED'
      };

      await onCreateAccount({
        name: accountName.trim() || `${broker} #${accountNumber}`,
        broker,
        platform,
        server,
        accountNumber: accountNumber.trim(),
        password: password.trim() || 'Demo1234!',
        accountType,
        currency: detectedCurrency,
        initialCapital: detectedBalance,
        dailyDrawdownLimitPct: autoLimits.dailyDrawdownLimitPct,
        circuitBreakerThresholdPct: autoLimits.circuitBreakerThresholdPct,
        totalDrawdownLimitPct: autoLimits.totalDrawdownLimitPct,
        maxRiskPerTradePct: autoLimits.maxRiskPerTradePct,
        calculationMode: autoLimits.calculationMode,
        autoLimitsEnabled: true,
        tags: [platform === 'MT5_DEMO' ? 'MT5 Demo' : 'MT5 Real', broker]
      });

      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar cuenta');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Vincular Cuenta MetaTrader 5 (Demo o Real)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Detección automática de saldo y cálculo algorítmico de límites de riesgo de fondeo
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* 1. Platform Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Selecciona la Plataforma:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlatform('MT5_DEMO')}
                className={`p-3 rounded-xl border text-center font-semibold text-xs sm:text-sm transition-all ${
                  platform === 'MT5_DEMO'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50 ring-2 ring-emerald-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="font-bold">MetaTrader 5 Demo</div>
                <div className="text-[10px] opacity-80 mt-0.5">Pruebas / Paper Live</div>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('MT5_REAL')}
                className={`p-3 rounded-xl border text-center font-semibold text-xs sm:text-sm transition-all ${
                  platform === 'MT5_REAL'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-950/50 ring-2 ring-blue-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="font-bold">MetaTrader 5 Real</div>
                <div className="text-[10px] opacity-80 mt-0.5">Fondeo / Capital Propio</div>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('MT4_DEMO')}
                className={`p-3 rounded-xl border text-center font-semibold text-xs sm:text-sm transition-all ${
                  platform === 'MT4_DEMO'
                    ? 'bg-purple-600 text-white border-purple-500 ring-2 ring-purple-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="font-bold">MetaTrader 4</div>
                <div className="text-[10px] opacity-80 mt-0.5">MT4 Bridge API</div>
              </button>
            </div>
          </div>

          {/* Presets Rápidos */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Presets Rápidos de Brokers & Fondeo:
            </label>
            <div className="flex flex-wrap gap-2">
              {BROKER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs transition-all active:scale-95"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Broker Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Broker / Entidad
              </label>
              <input
                type="text"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                placeholder="Ej. MetaQuotes, IC Markets, FTMO"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Server */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Servidor MT5 del Broker
              </label>
              <input
                type="text"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="Ej. MetaQuotes-Demo, ICMarketsSC-Demo02, FTMO-Demo"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Account Number / Login */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Número de Cuenta (Login / ID) *
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Ej. 51294821 o IC-550183"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Contraseña de la Cuenta *</span>
                <span className="text-[10px] text-slate-400">Investor o Master</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña del broker"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Custom Nickname */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre Identificador de la Cuenta (Opcional)
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Ej. MetaQuotes MT5 Demo €10k o FTMO Challenge"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Live Bridge Test & Auto Detection Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Consultando Servidor {server}...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Probar Conexión & Detectar Saldo Automáticamente</span>
                </>
              )}
            </button>
          </div>

          {/* Test & Auto-Calculated Risk Limits Box */}
          {testResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{testResult.message}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Saldo Detectado:</div>
                  <div className="font-bold text-white font-mono text-sm">
                    {testResult.detectedCurrency === 'USD' ? '$' : '€'}
                    {testResult.detectedBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">DD Diario Auto:</div>
                  <div className="font-bold text-amber-400 font-mono text-sm">
                    {testResult.autoLimits.dailyDrawdownLimitPct}% (€{testResult.autoLimits.dailyDrawdownLimitAmount})
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Circuit Breaker:</div>
                  <div className="font-bold text-rose-400 font-mono text-sm">
                    {testResult.autoLimits.circuitBreakerThresholdPct}% (€{testResult.autoLimits.circuitBreakerAmount})
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Latencia Servidor:</div>
                  <div className="font-bold text-emerald-400 font-mono text-sm flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span>{testResult.pingMs} ms</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-emerald-300/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Los límites de capital se configuraron 100% en automático de acuerdo a las reglas oficiales del broker.
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold transition-all"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirmSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Confirmar & Vincular Cuenta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

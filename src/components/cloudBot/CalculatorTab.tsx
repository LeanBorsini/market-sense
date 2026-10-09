import React, { useState } from 'react';
import { 
  Calculator, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  TrendingUp, 
  Info 
} from 'lucide-react';
import { CloudBotState, TradingAccount, SizingCalculationResult } from '../../types/cloudBot';

interface CalculatorTabProps {
  botState: CloudBotState | null;
  activeAccount: TradingAccount | undefined;
  onCalculateSizing: (symbol: string, balance: number, riskPct: number) => Promise<SizingCalculationResult>;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  botState,
  activeAccount,
  onCalculateSizing
}) => {
  const [symbol, setSymbol] = useState<string>('EURUSD');
  const [riskPercent, setRiskPercent] = useState<number>(0.75);
  const [calcResult, setCalcResult] = useState<SizingCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const balance = activeAccount?.balance || botState?.accountBalance || 10000;
  const currencySymbol = activeAccount?.currency === 'USD' ? '$' : '€';

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const res = await onCalculateSizing(symbol, balance, riskPercent);
      setCalcResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">
              Calculadora de Posición Institucional con Colchón Anti-Caza
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dimensionamiento exacto de lotaje basado en el balance detectado de la cuenta activa ({currencySymbol}{balance.toLocaleString('es-ES')})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Símbolo
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm"
            >
              <option value="EURUSD">EURUSD (Euro / Dólar)</option>
              <option value="XAUUSD">XAUUSD (Oro / Spot)</option>
              <option value="US30">US30 (Dow Jones)</option>
              <option value="BTCUSD">BTCUSD (Bitcoin)</option>
              <option value="GBPUSD">GBPUSD (Libra / Dólar)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Riesgo por Operación (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isCalculating ? 'Calculando...' : 'Calcular Lotaje Óptimo'}
            </button>
          </div>
        </div>

        {calcResult && (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Lotaje Recomendado:</span>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                  {calcResult.calculatedLots} lots
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Riesgo Monetario:</span>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  {currencySymbol}{calcResult.riskAmount.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Stop Loss Seguro:</span>
                <div className="text-xl font-bold text-rose-300 font-mono mt-0.5">
                  {calcResult.recommendedSlPips} pips
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Colchón Anti-Barrido:</span>
                <div className="text-xl font-bold text-blue-400 font-mono mt-0.5">
                  +{calcResult.antiHuntCushionPips} pips
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {calcResult.algorithmExplanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

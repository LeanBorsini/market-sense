import React from 'react';
import { Clock, ShieldAlert, TrendingUp, Scale, Info } from 'lucide-react';

export interface AsymmetryVisualMetrics {
  downsideRiskPercent: number; // e.g. 18 (representing -18%)
  downsidePrice: string; // e.g. "0.29 €"
  upsidePotentialPercent: number; // e.g. 140 (representing +140%)
  targetPrice: string; // e.g. "0.85 €"
  ratioText: string; // e.g. "1 : 4.8"
  timeHorizonEstimate: string; // e.g. "12 a 18 meses"
  timeHorizonCategory: 'Corto (1-3 meses)' | 'Medio (6-12 meses)' | 'Largo (12-24 meses)' | 'Estructural (2-3+ años)';
  patienceGuidance: string; // e.g. "El valor se desbloquea en los cierres de ejercicio; no mirar oscilaciones diarias."
}

interface AsymmetryVisualizerProps {
  metrics: AsymmetryVisualMetrics;
  currentPriceDisplay?: string;
  compact?: boolean;
}

export function createAsymmetryMetrics(opp: {
  ticker: string;
  currentPrice: string;
  potentialUpside: string;
  riskRewardRatio: string;
  targetPriceEstimated?: string;
  asymmetry?: AsymmetryVisualMetrics;
}): AsymmetryVisualMetrics {
  if (opp.asymmetry) return opp.asymmetry;

  const target = opp.targetPriceEstimated ? opp.targetPriceEstimated.split(' ')[0] : 'Consenso';
  return {
    downsideRiskPercent: 12,
    downsidePrice: 'Suelo técnico',
    upsidePotentialPercent: 30,
    targetPrice: target,
    ratioText: opp.riskRewardRatio.includes(':') ? opp.riskRewardRatio.split('(')[0].trim() : '1 : 3.5',
    timeHorizonEstimate: '12 a 18 meses',
    timeHorizonCategory: 'Largo (12-24 meses)',
    patienceGuidance: 'Inversión de maduración a medio plazo; no dejarse llevar por la volatilidad diaria.'
  };
}

export const AsymmetryVisualizer: React.FC<AsymmetryVisualizerProps> = ({
  metrics,
  currentPriceDisplay,
  compact = false
}) => {
  const {
    downsideRiskPercent,
    downsidePrice,
    upsidePotentialPercent,
    targetPrice,
    ratioText,
    timeHorizonEstimate,
    timeHorizonCategory,
    patienceGuidance
  } = metrics;

  // Calculate visual proportions for the minimal bar
  // Normalize visually so the downside is represented proportionally against upside
  const totalSpan = downsideRiskPercent + upsidePotentialPercent;
  const downsideWidthPercent = Math.max(15, Math.min(40, (downsideRiskPercent / totalSpan) * 100));
  const upsideWidthPercent = 100 - downsideWidthPercent;

  // Horizon badge colors
  const horizonBadgeColor = 
    timeHorizonCategory.includes('1-3') 
      ? 'bg-amber-50 text-amber-900 border-amber-200' 
      : timeHorizonCategory.includes('6-12')
        ? 'bg-blue-50 text-blue-900 border-blue-200'
        : timeHorizonCategory.includes('12-24')
          ? 'bg-purple-50 text-purple-900 border-purple-200'
          : 'bg-emerald-50 text-emerald-900 border-emerald-200';

  return (
    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-2.5">
      {/* Top Header: Asymmetry Title, Ratio & Estimated Time Horizon */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-slate-700" />
          <span className="text-xs font-bold text-slate-900">
            Asimetría Matemática:
          </span>
          <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200/80">
            {ratioText}
          </span>
        </div>

        {/* Time Horizon Pill - Directly eliminates anxiety & uncertainty */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${horizonBadgeColor}`}>
          <Clock className="w-3 h-3 shrink-0" />
          <span>Horizonte: <strong>{timeHorizonEstimate}</strong></span>
        </div>
      </div>

      {/* Minimalist Dual Proportional Bar */}
      <div className="space-y-1">
        <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-200 shadow-inner">
          {/* Downside Risk Segment (Sober rose/amber) */}
          <div 
            style={{ width: `${downsideWidthPercent}%` }} 
            className="h-full bg-rose-400/90 transition-all duration-300 relative group"
            title={`Riesgo a la baja: -${downsideRiskPercent}% (Suelo: ${downsidePrice})`}
          />
          {/* Upside Potential Segment (Sober forest emerald) */}
          <div 
            style={{ width: `${upsideWidthPercent}%` }} 
            className="h-full bg-emerald-600 transition-all duration-300 relative group"
            title={`Potencial estimado: +${upsidePotentialPercent}% (Objetivo: ${targetPrice})`}
          />
        </div>

        {/* Numerical Labels Underneath Bar */}
        <div className="flex items-center justify-between text-[11px] font-mono font-medium pt-0.5">
          {/* Downside numbers */}
          <div className="flex items-center gap-1 text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Riesgo: <strong>-{downsideRiskPercent}%</strong> ({downsidePrice})</span>
          </div>

          {/* Upside numbers */}
          <div className="flex items-center gap-1 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Potencial: <strong>+{upsidePotentialPercent}%</strong> ({targetPrice})</span>
          </div>
        </div>
      </div>

      {/* Plain Language Patience Guidance to Avoid Anxiety */}
      <div className="pt-1.5 border-t border-[#EDE8DE] flex items-start gap-1.5 text-[11px] text-slate-600 leading-snug">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800">Gestión de Expectativas:</strong> {patienceGuidance}
        </p>
      </div>
    </div>
  );
};

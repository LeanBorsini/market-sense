/**
 * AuditModal Component
 * 
 * Displays deep financial health audit results for any requested ticker worldwide.
 * Contrasts media narratives with real SEC/CNMV filings, EBITDA, debt coverage,
 * and tangible intrinsic valuation.
 */

import React from 'react';
import { X, Search, ShieldCheck, TrendingUp, Zap, HelpCircle } from 'lucide-react';
import { MovementCause } from '../../data/marketSignals';

interface AuditModalProps {
  auditedResult: MovementCause | null;
  onClose: () => void;
  onAddToWatchlist: (ticker: string) => void;
  isAlreadyTracked: boolean;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  auditedResult,
  onClose,
  onAddToWatchlist,
  isAlreadyTracked,
}) => {
  if (!auditedResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-[#DDD8CD] shadow-2xl p-5 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EDE8DE]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-extrabold text-sm bg-slate-900 text-white">
                {auditedResult.ticker}
              </span>
              <h3 className="font-bold text-base text-slate-900">
                {auditedResult.name}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono mt-0.5 block">
              {auditedResult.exchange} · Cotización Ref: {auditedResult.price} ({auditedResult.change})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why it moves today */}
        <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Causa Real de Mercado:
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {auditedResult.rootCause}
          </p>
        </div>

        {/* Noise Filter */}
        <div className="p-3.5 rounded-xl bg-white border border-[#DDD8CD] space-y-1">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Filtro de Ruido & Prensa:
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            {auditedResult.noiseExplanation}
          </p>
        </div>

        {/* Accounting Health */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Salud Contable Tangible (EBITDA, Deuda & Caja):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold block">EBITDA & Márgenes</span>
              <p className="text-xs font-medium text-slate-800">{auditedResult.ebitdaImpact}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold block">Deuda & Solvencia</span>
              <p className="text-xs font-medium text-slate-800">{auditedResult.debtSolvencyImpact}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-1">
              <span className="text-[11px] text-slate-500 font-semibold block">Flujo de Caja Libre</span>
              <p className="text-xs font-medium text-slate-800">{auditedResult.cashFlowImpact}</p>
            </div>
          </div>
        </div>

        {/* Executive Verdict */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Veredicto Ejecutivo:
            </strong>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {auditedResult.verdict}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#EDE8DE] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Cerrar Auditoría
          </button>

          {!isAlreadyTracked ? (
            <button
              type="button"
              onClick={() => {
                onAddToWatchlist(auditedResult.ticker);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              + Añadir a mi Cartera
            </button>
          ) : (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              ✓ Ya está en tu cartera
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

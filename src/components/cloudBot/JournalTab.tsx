import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Flame, 
  Info, 
  Clock 
} from 'lucide-react';
import { CloudBotState } from '../../types/cloudBot';

interface JournalTabProps {
  botState: CloudBotState | null;
  onAddNote: (tradeId: string, note: string) => void;
}

export const JournalTab: React.FC<JournalTabProps> = ({ botState }) => {
  const closedTrades = botState?.closedTrades || [];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">
              Diario Algorítmico & Auditoría Post-Mortem ({closedTrades.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Detección de barridos de liquidez institucional y cazas de mecha (wick hunts)
          </span>
        </div>

        {closedTrades.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
            Aún no hay operaciones cerradas en esta sesión. Los trades completados se registrarán aquí con su autopsia de ejecución.
          </div>
        ) : (
          <div className="space-y-3">
            {closedTrades.map((trade) => {
              const isWin = (trade.pnlEur || 0) > 0;

              return (
                <div 
                  key={trade.id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 hover:border-slate-600 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{trade.symbol}</span>
                      <span className={`px-2 py-0.2 rounded text-xs font-mono ${
                        trade.direction === 'BUY' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {trade.direction} {trade.lotSize}L
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Ticket #{trade.ticket}
                      </span>
                    </div>

                    <div className={`font-bold font-mono text-sm ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isWin ? '+' : ''}€{(trade.pnlEur || 0).toFixed(2)} ({isWin ? '+' : ''}{(trade.pnlPct || 0).toFixed(2)}%)
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-2">
                    <span className="font-semibold text-slate-400">Razón de entrada: </span>
                    {trade.entryRationale}
                  </p>

                  {trade.postMortem && (
                    <div className="text-xs bg-blue-950/40 border border-blue-500/20 p-2.5 rounded-lg text-blue-200">
                      <span className="font-semibold text-blue-300">Autopsia IA: </span>
                      {trade.postMortem.detailedAnalysis}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

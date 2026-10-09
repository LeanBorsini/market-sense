import React from 'react';
import { 
  Dna, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { CloudBotState } from '../../types/cloudBot';

interface EvolutionTabProps {
  botState: CloudBotState | null;
}

export const EvolutionTab: React.FC<EvolutionTabProps> = ({ botState }) => {
  const evolutionLog = botState?.evolutionLog || [];
  const avoided = botState?.wickHuntsAvoided || 4;
  const efficiency = botState?.antiHuntEfficiencyPct || 87.5;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Calibración Evolutiva & Adaptación de Colchones de Volatilidad
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Eficiencia Anti-Caza:</span>
            <span className="font-bold text-emerald-400 font-mono">{efficiency}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs">Barridos Neutralizados:</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {avoided} wick hunts
            </div>
          </div>
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs">Adaptaciones ATR Dinámicas:</span>
            <div className="text-xl font-bold text-blue-400 font-mono mt-0.5">
              {evolutionLog.length} eventos
            </div>
          </div>
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-xs">Fórmula Anti-Fondeo:</span>
            <div className="text-xs font-semibold text-slate-200 mt-1">
              SL = Swing High/Low ± (1.5 × ATR + Colchón Broker)
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Historial de Adaptaciones Algorítmicas:
          </span>

          {evolutionLog.length === 0 ? (
            <div className="text-slate-500 text-xs italic py-4 text-center">
              Sin eventos recientes. El algoritmo calibra colchones ante cada intento de barrido detectado.
            </div>
          ) : (
            evolutionLog.map((event) => (
              <div 
                key={event.id}
                className="bg-slate-800/50 border border-slate-700/70 p-3 rounded-xl flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{event.symbol}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] bg-slate-700 text-slate-300 font-mono">
                      {event.triggerEvent}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    {event.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-emerald-400 font-bold">
                    +{event.cushionAfter} pips
                  </div>
                  <span className="text-[10px] text-slate-500">{event.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

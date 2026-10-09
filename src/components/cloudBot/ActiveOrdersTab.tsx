import React from 'react';
import { 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock 
} from 'lucide-react';
import { CloudBotState, DetailedTrade } from '../../types/cloudBot';

interface ActiveOrdersTabProps {
  botState: CloudBotState | null;
}

export const ActiveOrdersTab: React.FC<ActiveOrdersTabProps> = ({ botState }) => {
  const activeOrders = botState?.activeOrders || [];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">
              Órdenes Activas en Mercado ({activeOrders.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Monitoreadas tick a tick con Stop Loss y Take Profit protegidos
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <Radio className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
            <h4 className="text-sm font-semibold text-slate-300">No hay órdenes activas en este momento</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              El bot está vigilando los gráficos. En cuanto una estrategia cumpla sus condiciones de entrada cuantitativas, abrirá la posición con cálculo exacto de lotaje.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((trade) => {
              const isBuy = trade.direction === 'BUY';
              const isProfit = (trade.floatingPnlEur || 0) >= 0;

              return (
                <div 
                  key={trade.id}
                  className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{trade.symbol}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                        isBuy ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {isBuy ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{trade.direction}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {trade.lotSize} lots
                      </span>
                    </div>

                    <div className={`text-sm font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}€{(trade.floatingPnlEur || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
                    <div>
                      <span className="text-slate-500 text-[10px]">Entrada:</span>
                      <div className="font-mono text-slate-200">{trade.entryPrice}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Stop Loss:</span>
                      <div className="font-mono text-rose-300">{trade.slPrice}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Take Profit:</span>
                      <div className="font-mono text-emerald-300">{trade.tpPrice}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">Estrategia: <strong className="text-slate-300">{trade.strategyName}</strong></span>
                    <span className="text-emerald-400 font-medium">+{trade.antiHuntCushionPips} pips colchón</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

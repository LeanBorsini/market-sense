/**
 * TradingViewModal Component
 * 
 * Embeds an interactive, real-time TradingView technical chart
 * preloaded with key institutional indicators for fundamental investors:
 * - SMA 200 (200-period Simple Moving Average: Institutional floor / ceiling)
 * - EMA 50 (50-period Exponential Moving Average: Intermediate trend)
 * - RSI 14 (14-period Relative Strength Index: Capitulation < 35 / Overbought > 70)
 * - Volume Profile / Bar Volume
 * 
 * Solves the problem of manually adding indicators every time TradingView is opened.
 */

import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, HelpCircle, Activity, ChevronDown, ChevronUp, Layers, Check } from 'lucide-react';
import { resolveTradingViewSymbol } from '../../lib/symbolResolver';

declare global {
  interface Window {
    TradingView?: any;
  }
}

interface TradingViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  name: string;
  tradingViewSymbol: string;
  price: string;
  change: string;
  trafficLight?: 'VERDE' | 'AMBAR' | 'ROJO';
}

type ChartInterval = 'D' | 'W' | 'M' | '240';
type IndicatorPreset = 'investor_complete' | 'pivots_math' | 'institutional_floor' | 'clean';

export const TradingViewModal: React.FC<TradingViewModalProps> = ({
  isOpen,
  onClose,
  ticker,
  name,
  tradingViewSymbol,
  price,
  change,
  trafficLight = 'VERDE',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interval, setInterval] = useState<ChartInterval>('D');
  const [preset, setPreset] = useState<IndicatorPreset>('investor_complete');
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Normalize trading view symbol (e.g. "OANDA:XAUUSD" for GOLD, "BME:OHLA", "AMEX:VOO")
  const formattedSymbol = resolveTradingViewSymbol(ticker, tradingViewSymbol);

  // Load TradingView script once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.TradingView) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('tradingview-widget-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize or re-render widget when symbol, interval, preset or script state changes
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const containerId = `tv_chart_${formattedSymbol.replace(/[^a-zA-Z0-9]/g, '_')}`;
    containerRef.current.innerHTML = `<div id="${containerId}" class="w-full h-full"></div>`;

    // Determine studies based on active preset
    const studiesList: any[] = [];
    if (preset === 'investor_complete') {
      studiesList.push(
        {
          id: "MASimple@tv-basicstudies",
          inputs: { length: 200 }
        },
        {
          id: "MAExp@tv-basicstudies",
          inputs: { length: 50 }
        },
        {
          id: "RSI@tv-basicstudies",
          inputs: { length: 14 }
        }
      );
    } else if (preset === 'pivots_math') {
      studiesList.push(
        {
          id: "PivotPointsStandard@tv-basicstudies",
        },
        {
          id: "MASimple@tv-basicstudies",
          inputs: { length: 200 }
        }
      );
    } else if (preset === 'institutional_floor') {
      studiesList.push(
        {
          id: "MASimple@tv-basicstudies",
          inputs: { length: 200 }
        },
        {
          id: "RSI@tv-basicstudies",
          inputs: { length: 14 }
        }
      );
    }

    const initWidget = () => {
      if (window.TradingView && document.getElementById(containerId)) {
        try {
          new window.TradingView.widget({
            autosize: true,
            symbol: formattedSymbol,
            interval: interval,
            timezone: "Europe/Madrid",
            theme: "light",
            style: "1", // Japanese Candlesticks
            locale: "es",
            toolbar_bg: "#FAF8F5",
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            container_id: containerId,
            studies: studiesList,
            studies_overrides: {
              "moving average.precision": 2,
            }
          });
        } catch (err) {
          console.error("Error initializing TradingView widget:", err);
        }
      }
    };

    if (window.TradingView) {
      initWidget();
    } else {
      const timer = setTimeout(initWidget, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, formattedSymbol, interval, preset, scriptLoaded]);

  if (!isOpen) return null;

  // Quick mathematical reference levels derived from price
  const numPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
  const currencySymbol = price.includes('€') ? '€' : price.includes('$') ? '$' : '';
  const isCents = numPrice > 0 && numPrice < 5;
  const approxS1 = numPrice > 0 ? (numPrice * 0.975).toFixed(isCents ? 4 : 2) : '';
  const approxS2 = numPrice > 0 ? (numPrice * 0.950).toFixed(isCents ? 4 : 2) : '';
  const approxR1 = numPrice > 0 ? (numPrice * 1.025).toFixed(isCents ? 4 : 2) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-5xl h-[92vh] sm:h-[88vh] bg-white rounded-2xl border border-[#DDD8CD] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-4 bg-[#FAF8F5] border-b border-[#EDE8DE] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-sm bg-slate-900 text-white">
                {ticker}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate max-w-[180px] sm:max-w-none">
                {name}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-bold text-slate-800">{price}</span>
              <span className={`font-semibold ${change.startsWith('+') ? 'text-emerald-700' : 'text-rose-700'}`}>
                ({change})
              </span>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <a
              href={`https://es.tradingview.com/chart/?symbol=${encodeURIComponent(formattedSymbol)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition flex items-center gap-1"
              title="Abrir este gráfico en pantalla completa en la web oficial de TradingView"
            >
              <span>TradingView Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
              aria-label="Cerrar gráfico"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar: Timeframes & Indicator Template Switcher */}
        <div className="px-3.5 py-2 bg-[#F8F6F0] border-b border-[#E7E2D8] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 hidden sm:inline">Temporalidad:</span>
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#DDD8CD]">
              <button
                type="button"
                onClick={() => setInterval('D')}
                className={`px-2 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                  interval === 'D' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Velas Diarias (1D) - Ideal para ver soportes inmediatos"
              >
                Diario (1D)
              </button>
              <button
                type="button"
                onClick={() => setInterval('W')}
                className={`px-2 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                  interval === 'W' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Velas Semanales (1W) - Ideal para ver grandes ciclos institucionales"
              >
                Semanal (1W)
              </button>
              <button
                type="button"
                onClick={() => setInterval('M')}
                className={`px-2 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                  interval === 'M' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Velas Mensuales (1M) - Visión macro histórica"
              >
                Mensual (1M)
              </button>
            </div>
          </div>

          {/* Indicator Preset Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 hidden md:inline">Plantilla IA:</span>
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#DDD8CD]">
              <button
                type="button"
                onClick={() => setPreset('investor_complete')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                  preset === 'investor_complete' 
                    ? 'bg-purple-700 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="SMA 200 + EMA 50 + RSI 14 + Volumen"
              >
                <Activity className="w-3 h-3" />
                <span>Inversor Pro (SMA 200 + RSI)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('pivots_math')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                  preset === 'pivots_math' 
                    ? 'bg-purple-700 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Soportes y Resistencias Matemáticas calculadas por Puntos Pivote (S1, S2, R1, R2)"
              >
                <span>📐 Soportes Matemáticos (Pivotes)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('institutional_floor')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                  preset === 'institutional_floor' 
                    ? 'bg-purple-700 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Solo SMA 200 y RSI 14"
              >
                <span>Solo Suelo SMA200</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset('clean')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                  preset === 'clean' 
                    ? 'bg-purple-700 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sin indicadores superpuestos"
              >
                <span>Limpio</span>
              </button>
            </div>
          </div>

          {/* Toggle Cheat Sheet Help */}
          <button
            type="button"
            onClick={() => setShowCheatSheet(!showCheatSheet)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold transition cursor-pointer ml-auto sm:ml-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">¿Cómo interpretar?</span>
            {showCheatSheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Educational Cheat Sheet for the User's Profile */}
        {showCheatSheet && (
          <div className="p-3 bg-amber-50/90 border-b border-amber-200 text-xs text-amber-950 space-y-2 animate-fadeIn shrink-0">
            <strong className="block font-bold text-amber-950">
              💡 Guía de Decisión para tu Perfil Inversor:
            </strong>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11.5px] leading-relaxed">
              <div className="p-2 rounded-lg bg-white border border-amber-200">
                <span className="font-bold text-emerald-800 block">🟢 Soportes Matemáticos (S1 / S2):</span>
                Líneas inferiores calculadas por Puntos Pivote. Actúan como suelos automáticos donde entran órdenes de compra de rebote intradía y swing.
              </div>
              <div className="p-2 rounded-lg bg-white border border-amber-200">
                <span className="font-bold text-amber-800 block">🟡 Pivote Central (P):</span>
                El precio de equilibrio matemático de la sesión. Cotizar por encima indica sesgo comprador; por debajo, sesgo vendedor.
              </div>
              <div className="p-2 rounded-lg bg-white border border-amber-200">
                <span className="font-bold text-rose-800 block">🔴 Resistencias Matemáticas (R1 / R2):</span>
                Techos objetivos donde los operadores toman beneficios rápidos y el precio suele frenar su impulso temporal.
              </div>
            </div>
          </div>
        )}

        {/* Active Indicators Legend Strip */}
        <div className="px-3.5 py-1.5 bg-[#FAF8F5] border-b border-[#EDE8DE] flex items-center gap-3 overflow-x-auto text-[11px] font-mono shrink-0">
          <span className="text-slate-500 font-sans font-semibold">Indicadores Activos:</span>
          {preset === 'pivots_math' && (
            <>
              <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Puntos Pivote en Gráfico (S1, S2, R1, R2)
              </span>
              {approxS1 && (
                <span className="flex items-center gap-2 px-2 py-0.5 rounded bg-white border border-[#DDD8CD] text-[11px] font-mono text-slate-700">
                  <span>Suelo 1: <strong className="text-emerald-700">{approxS1} {currencySymbol}</strong></span>
                  <span>·</span>
                  <span>Suelo 2: <strong className="text-emerald-700">{approxS2} {currencySymbol}</strong></span>
                  <span>·</span>
                  <span>Techo 1: <strong className="text-rose-700">{approxR1} {currencySymbol}</strong></span>
                </span>
              )}
              <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                SMA 200
              </span>
            </>
          )}
          {preset === 'investor_complete' && (
            <>
              <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                SMA 200 (Suelo Institucional)
              </span>
              <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                EMA 50 (Medio Plazo)
              </span>
              <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                RSI 14 (Capitulación / Euforia)
              </span>
            </>
          )}
          {preset === 'institutional_floor' && (
            <>
              <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                SMA 200
              </span>
              <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                RSI 14
              </span>
            </>
          )}
          {preset === 'clean' && (
            <span className="text-slate-500 font-sans">Sin indicadores técnicos superpuestos.</span>
          )}
        </div>

        {/* Chart Viewport Container */}
        <div className="flex-1 w-full h-full relative bg-[#FAF8F5] min-h-[300px]">
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

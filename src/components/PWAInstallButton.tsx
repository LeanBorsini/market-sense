import React, { useState } from 'react';
import { Download, X, Check, Laptop, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA in standalone window, show subtle status badge
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shrink-0">
        <Check className="w-3.5 h-3.5" /> PWA
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="tactile-btn flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-950/40 transition active:scale-95 shrink-0"
        title="Instalar MarketSense en tu Teléfono o PC"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden text-[11px]">App</span>
      </button>

      {showGuide && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex min-h-full items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setShowGuide(false)}
        >
          <div 
            className="relative w-full max-w-md mx-auto my-auto rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                Cómo Instalar MarketSense
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              MarketSense es una <strong>PWA (Aplicación Web Progresiva)</strong>. Puedes instalarla gratis en tu pantalla de inicio sin pasar por tiendas:
            </p>

            <div className="space-y-3 text-xs">
              
              {/* Android Guide */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Smartphone className="w-4 h-4" /> En Celulares Android (Chrome):
                </div>
                <ol className="text-slate-300 space-y-1 pl-4 list-decimal text-[11px] leading-relaxed">
                  <li>Toca los <strong>3 puntos verticales (⋮)</strong> arriba a la derecha en Chrome.</li>
                  <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a pantalla de inicio"</strong>.</li>
                  <li>Presiona <strong>Instalar</strong>. ¡Aparecerá el icono en tu pantalla!</li>
                </ol>
              </div>

              {/* iPhone Guide */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Smartphone className="w-4 h-4" /> En iPhone / iPad (Safari):
                </div>
                <ol className="text-slate-300 space-y-1 pl-4 list-decimal text-[11px] leading-relaxed">
                  <li>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba).</li>
                  <li>Desliza hacia abajo y presiona <strong>"Añadir a pantalla de inicio" (+)</strong>.</li>
                  <li>Listo, se abrirá a pantalla completa como una app nativa.</li>
                </ol>
              </div>

              {/* PC / Desktop Guide */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Laptop className="w-4 h-4" /> En Computadora (PC / Mac con Chrome o Edge):
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Haz clic en el icono de <strong>pantalla con flecha (🖥️ ⬇️)</strong> situado al final de la barra de direcciones de tu navegador, o en los 3 puntos &gt; <em>"Guardar y compartir"</em> &gt; <strong>"Instalar MarketSense"</strong>.
                </p>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

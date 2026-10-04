/**
 * ProfilesModal Component
 * 
 * Manages investor profiles (Personal, Partner, Family, IBKR) and 
 * configures direct Telegram bot dispatching, chat ID auto-detection,
 * and automated market window notifications.
 */

import React, { useState } from 'react';
import { Send, X, Sparkles, RefreshCw, Search, Clock, CheckCircle } from 'lucide-react';
import { UserProfile } from '../../data/assets';

interface ProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customBotToken: string;
  setCustomBotToken: (token: string) => void;
  customChatId: string;
  setCustomChatId: (id: string) => void;
  chatDisplayName: string;
  setChatDisplayName: (name: string) => void;
  autoDispatchEnabled: boolean;
  setAutoDispatchEnabled: (enabled: boolean) => void;
  onSendTestDispatch: () => Promise<void>;
  isSendingTelegram: boolean;
}

export const ProfilesModal: React.FC<ProfilesModalProps> = ({
  isOpen,
  onClose,
  customBotToken,
  setCustomBotToken,
  customChatId,
  setCustomChatId,
  chatDisplayName,
  setChatDisplayName,
  autoDispatchEnabled,
  setAutoDispatchEnabled,
  onSendTestDispatch,
  isSendingTelegram,
}) => {
  const [showBotGuide, setShowBotGuide] = useState(false);
  const [showCronGuide, setShowCronGuide] = useState(false);
  const [isDetectingChatId, setIsDetectingChatId] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-detect Telegram Group or Channel Chat ID via getUpdates
  const detectChatIdAutomatically = async () => {
    if (!customBotToken.trim()) {
      setDetectStatus('⚠️ Primero pega tu Bot Token arriba.');
      return;
    }
    setIsDetectingChatId(true);
    setDetectStatus(null);
    try {
      let data: any = null;
      try {
        const proxyRes = await fetch('/api/telegram-detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: customBotToken.trim() }),
        });
        if (proxyRes.ok) {
          data = await proxyRes.json();
        }
      } catch {
        // Fallback to direct client call if server proxy unavailable
      }

      if (!data) {
        const res = await fetch(`https://api.telegram.org/bot${customBotToken.trim()}/getUpdates`);
        data = await res.json();
      }

      if (!data?.ok) {
        setDetectStatus(`❌ Error del bot: ${data?.description || 'No se pudo conectar con el bot'}`);
        return;
      }

      const updates = data.result || [];
      let foundChatId: string = '';
      let foundTitle: string = '';

      for (let i = updates.length - 1; i >= 0; i--) {
        const u = updates[i];
        const chat = u.message?.chat || u.my_chat_member?.chat || u.channel_post?.chat;
        if (chat && chat.id) {
          foundChatId = String(chat.id);
          foundTitle = chat.title || chat.username || chat.first_name || 'Market_sense';
          break;
        }
      }

      if (foundChatId) {
        setCustomChatId(foundChatId);
        localStorage.setItem('marketsense_tg_chatid', foundChatId);
        if (foundTitle && foundTitle !== 'Grupo') {
          setChatDisplayName(foundTitle);
          localStorage.setItem('marketsense_tg_display_name', foundTitle);
        }
        setDetectStatus(`✅ ¡Detectado con éxito! Grupo: "${foundTitle}" (ID: ${foundChatId}). Ya puedes pulsar Guardar y Enviar.`);
      } else {
        setDetectStatus('💡 Escribe un mensaje de prueba (ej. "hola") dentro de tu grupo de Telegram y vuelve a pulsar.');
      }
    } catch (err: any) {
      setDetectStatus(`❌ Error de conexión: ${err.message || 'Verifica tu red'}`);
    } finally {
      setIsDetectingChatId(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white border border-[#DDD8CD] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-3">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-[#191C21]">
              Despacho Directo a Telegram (Bot Oficial)
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Configura tu Bot de Telegram para que MarketSense envíe tus informes y alertas al canal de tus colegas o a tu chat privado con 1 solo clic en segundo plano.
        </p>

        {/* Quick Guide Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowBotGuide(!showBotGuide)}
            className="text-xs text-emerald-700 hover:text-emerald-800 underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showBotGuide ? 'Ocultar Guía' : '¿Cómo se crea el Bot y el Canal? (Guía 2 min)'}</span>
          </button>

          {showBotGuide && (
            <div className="mt-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#DDD8CD] text-xs text-slate-700 space-y-2 animate-fadeIn">
              <strong className="text-slate-900 block">Paso a Paso Rápido (100% Gratis):</strong>
              <p>1. En Telegram busca a <code>@BotFather</code> y escribe <code>/newbot</code>.</p>
              <p>2. Asígnale nombre y usuario. BotFather te responderá con tu <strong>Bot Token</strong> (algo como <code>7123456789:AAHk...</code>).</p>
              <p>3. <strong>Para enviar a un Canal o Grupo con amigos:</strong> Crea el canal, añade tu bot como <strong>Administrador</strong> y escribe en Chat ID el <code>@nombre_de_tu_canal</code> o usa el botón de autodetección.</p>
              <p>4. <strong>Para enviarte solo a ti:</strong> Inicia chat con tu bot y escribe tu ID de usuario de Telegram.</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-700 font-semibold block mb-1">
              Nombre visible en el botón de la app
            </label>
            <input
              type="text"
              placeholder="ej. Market_sense"
              value={chatDisplayName}
              onChange={(e) => {
                setChatDisplayName(e.target.value);
                localStorage.setItem('marketsense_tg_display_name', e.target.value);
              }}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD8CD] text-[#191C21] text-xs focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-semibold block mb-1">
              Bot Token (de @BotFather)
            </label>
            <input
              type="text"
              placeholder="ej. 7123456789:AAHkL9Z..."
              value={customBotToken}
              onChange={(e) => setCustomBotToken(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD8CD] text-[#191C21] font-mono text-xs focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-700 font-semibold block">
                Chat ID Técnico de Telegram
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Grupos: requiere ID numérico
              </span>
            </div>
            <input
              type="text"
              placeholder="ej. -1004499299168"
              value={customChatId}
              onChange={(e) => setCustomChatId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD8CD] text-[#191C21] font-mono text-xs focus:outline-none focus:border-emerald-700"
            />

            {/* Auto-detect button for groups */}
            <div className="mt-2 p-2.5 rounded-xl bg-[#F5F2EB] border border-[#DDD8CD] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800">
                  ¿Tienes un Grupo como "Market_sense"?
                </span>
                <button
                  type="button"
                  onClick={detectChatIdAutomatically}
                  disabled={isDetectingChatId}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isDetectingChatId ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3 h-3" />
                      <span>🔍 Detectar ID de mi Grupo</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Telegram requiere su <strong>Chat ID numérico</strong> (que empieza por un guion negativo, ej. <code>-100...</code>).
                <br />
                👉 <em>Escribe una palabra en tu grupo (ej. "hola") y luego toca el botón verde para que se rellene solo.</em>
              </p>
              {detectStatus && (
                <div className="text-[11px] p-2 rounded-lg bg-white border border-[#DDD8CD] leading-snug">
                  {detectStatus}
                </div>
              )}
            </div>
          </div>

          {/* Automated Market Windows Dispatch Toggle */}
          <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#DDD8CD] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-800" />
                <span className="text-xs font-bold text-slate-900">
                  Auto-Despacho en Horarios de Mercado & FED
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newVal = !autoDispatchEnabled;
                  setAutoDispatchEnabled(newVal);
                  localStorage.setItem('marketsense_tg_auto_dispatch', String(newVal));
                }}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  autoDispatchEnabled
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {autoDispatchEnabled ? 'Activado' : 'Pausado'}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cuando la app está abierta durante las campanas bursátiles o noticias decisivas, despacha sola el informe a <strong>{chatDisplayName || 'Market_sense'}</strong> (09:00, 15:30, 20:00 y 22:00 CET).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#E7E2D8]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-[#DDD8CD] hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Cerrar
          </button>
          
          <button
            type="button"
            onClick={async () => {
              localStorage.setItem('marketsense_tg_token', customBotToken);
              localStorage.setItem('marketsense_tg_chatid', customChatId);
              localStorage.setItem('marketsense_tg_display_name', chatDisplayName);
              await onSendTestDispatch();
            }}
            disabled={isSendingTelegram}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTelegram ? 'Enviando...' : 'Guardar y Enviar Prueba'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

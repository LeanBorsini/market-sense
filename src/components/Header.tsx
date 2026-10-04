/**
 * Header Component
 * 
 * Top editorial navigation bar containing:
 * - Brand identity & Dynamic multi-timezone clock (Local, NY, Dublin)
 * - Live market bell indicator & interactive price feed sync
 * - Direct Telegram dispatch button & settings trigger
 * - Progressive Web App (PWA) installation button
 * - Google Auth / Local offline session manager
 * - Universal fundamental search & auditor input
 * - 4-Tab core view switcher (Watchlist, News, Radar, Calendar)
 */

import React from 'react';
import { 
  Clock, 
  RefreshCw, 
  Send, 
  Settings, 
  Search, 
  Copy, 
  ExternalLink, 
  BarChart2, 
  HelpCircle, 
  Sparkles, 
  Globe,
  Feather 
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ActiveSection, TypographyTheme } from '../types/market';

interface HeaderProps {
  clockMode: 'local' | 'ny' | 'dublin';
  clockTime: string;
  userCity: string;
  toggleClockMode: () => void;
  currentMarketWindow: { name: string; timeLabel: string };
  autoDispatchEnabled: boolean;
  isUpdatingPrices: boolean;
  lastPriceUpdateTime: string;
  onRefreshQuotes: () => Promise<void>;
  isSendingTelegram: boolean;
  customChatId: string;
  chatDisplayName: string;
  onSendTelegram: () => Promise<void>;
  onOpenTelegramSettings: () => void;
  currentUser: any;
  isLoggingIn: boolean;
  onLoginWithGoogle: () => Promise<void>;
  onLogout: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (e?: React.FormEvent) => void;
  authError: string | null;
  authErrorCode: string | null;
  onClearAuthError: () => void;
  onEnableLocalProfile: (name: string) => void;
  activeSection: ActiveSection;
  setActiveSection: (sec: ActiveSection) => void;
  isCopied: boolean;
  copyText: (text: string) => void;
  typographyTheme: TypographyTheme;
  toggleTypographyTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  clockMode,
  clockTime,
  userCity,
  toggleClockMode,
  currentMarketWindow,
  autoDispatchEnabled,
  isUpdatingPrices,
  lastPriceUpdateTime,
  onRefreshQuotes,
  isSendingTelegram,
  customChatId,
  chatDisplayName,
  onSendTelegram,
  onOpenTelegramSettings,
  currentUser,
  isLoggingIn,
  onLoginWithGoogle,
  onLogout,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  authError,
  authErrorCode,
  onClearAuthError,
  onEnableLocalProfile,
  activeSection,
  setActiveSection,
  isCopied,
  copyText,
  typographyTheme,
  toggleTypographyTheme,
}) => {
  return (
    <>
      <header className="border-b border-[#E7E2D8] bg-[#F8F6F0]/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Dublin Clock */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#191C21] text-[#FBF9F4] flex items-center justify-center font-bold font-mono text-sm shadow-sm">
                MS
              </div>
              <div>
                <span className="text-base font-bold text-[#191C21] tracking-tight flex items-center gap-1.5">
                  MarketSense
                  <span className="text-[11px] font-normal text-slate-500 font-serif italic hidden sm:inline">· Inteligencia Fundamental</span>
                </span>
              </div>
            </div>

            {/* Interactive Device / Market Clock */}
            <button
              type="button"
              onClick={toggleClockMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFECE4] hover:bg-[#E5E1D5] border border-[#DDD8CD] text-[11px] font-mono text-slate-700 transition cursor-pointer select-none"
              title="Toca para alternar entre tu hora local, Wall Street (NY) o Europa (Dublín/Madrid)"
            >
              <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>
                {clockMode === 'local' ? `Tu Hora (${userCity})` : clockMode === 'ny' ? 'Wall St (NY)' : 'Dublín / BME'}:
                <strong className="text-[#191C21] ml-1">{clockTime || '17:30'}</strong>
              </span>
              <span className="text-[10px] text-slate-400 ml-0.5" title="Cambiar zona">⇄</span>
            </button>

            {/* Next Market Bell Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#DDD8CD] text-[11px] text-slate-600">
              <span className={`w-2 h-2 rounded-full ${autoDispatchEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>Campana: <strong className="text-slate-900">{currentMarketWindow.name} ({currentMarketWindow.timeLabel})</strong></span>
              {autoDispatchEnabled && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">Auto</span>
              )}
            </div>

            {/* Live Market Feed Status Pill & Manual Sync */}
            <button
              type="button"
              onClick={() => onRefreshQuotes()}
              disabled={isUpdatingPrices}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] hover:bg-emerald-50 border border-[#DDD8CD] text-[11px] text-slate-700 transition cursor-pointer select-none"
              title="Precios de mercado sincronizados con Interactive Brokers / Yahoo Finance. Toca para actualizar en vivo."
            >
              <span className={`w-2 h-2 rounded-full ${isUpdatingPrices ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className="font-mono text-slate-800">{lastPriceUpdateTime}</span>
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isUpdatingPrices ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Quick Actions: Direct Telegram Send, PWA Install & Settings */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSendTelegram()}
              disabled={isSendingTelegram}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
              title="Despachar informe a Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSendingTelegram 
                  ? 'Enviando...' 
                  : customChatId 
                    ? `Enviar a ${chatDisplayName || 'Market_sense'}` 
                    : 'Enviar a Telegram'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenTelegramSettings}
              className="p-1.5 rounded-lg bg-[#EFECE4] hover:bg-[#E5E1D5] text-slate-600 hover:text-slate-900 border border-[#DDD8CD] transition cursor-pointer"
              title="Configurar Bot y Canal de Telegram"
            >
              <Settings className="w-4 h-4" />
            </button>

            <PWAInstallButton />

            {/* Typography Theme Switcher Button */}
            <button
              type="button"
              onClick={toggleTypographyTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAF8F5] border border-[#DDD8CD] text-xs font-medium text-slate-700 transition cursor-pointer select-none shadow-2xs active:scale-95"
              title={`Tipografía: ${
                typographyTheme === 'editorial_pluma' 
                  ? 'Pluma & Tinta (Cormorant Garamond - Clásica / Intrépida)' 
                  : typographyTheme === 'prensa_financiera' 
                    ? 'Prensa Financiera (Newsreader)' 
                    : 'Moderna Minimal (Plus Jakarta)'
              }. Toca para alternar estilo.`}
            >
              <Feather className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span className="hidden md:inline font-serif text-[11px]">
                {typographyTheme === 'editorial_pluma' ? 'Pluma & Tinta' : typographyTheme === 'prensa_financiera' ? 'Prensa' : 'Moderna'}
              </span>
            </button>

            {/* User Profile / Google Auth Pill */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EFECE4] border border-[#DDD8CD] text-xs">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || ''} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">
                    {currentUser.displayName?.[0] || 'U'}
                  </div>
                )}
                <span className="font-semibold text-slate-800 hidden sm:inline max-w-[85px] truncate" title={currentUser.email || ''}>
                  {currentUser.displayName?.split(' ')[0] || 'Mi Cartera'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Sincronizado en la Nube"></span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-[10px] text-slate-400 hover:text-rose-700 ml-0.5 cursor-pointer"
                  title="Cerrar sesión"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLoginWithGoogle}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-[#DDD8CD] text-xs font-semibold transition active:scale-95 shadow-2xs cursor-pointer disabled:opacity-60"
                title="Inicia sesión con Google para sincronizar tu cartera personal en la nube"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.39 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
                  </svg>
                )}
                <span>{isLoggingIn ? 'Conectando...' : 'Iniciar Sesión'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="max-w-5xl mx-auto mt-2.5">
          <form onSubmit={onSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar y auditar activo (ej. NVDA, VOO, BTC, SAN)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-24 py-1.5 rounded-lg bg-white border border-[#DDD8CD] text-xs text-[#191C21] placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs transition"
            />
            <button
              type="submit"
              className="absolute right-1 px-2.5 py-1 rounded bg-[#EFECE4] hover:bg-[#E5E1D5] text-[11px] font-semibold text-slate-700 transition cursor-pointer"
            >
              Auditar
            </button>
          </form>
        </div>
      </header>

      {/* Auth Error Banner / Domain Authorization Helper */}
      {authError && (
        <div className="bg-amber-50/95 border-b border-amber-300 px-4 py-3.5 text-xs text-amber-950 shadow-xs">
          <div className="max-w-5xl mx-auto space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xl shrink-0">🔐</span>
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">
                    {authErrorCode === 'auth/unauthorized-domain' 
                      ? 'Autorización de Dominio en Firebase Requerida' 
                      : 'Aviso sobre Inicio de Sesión'}
                  </h4>
                  <p className="mt-1 text-amber-900 leading-relaxed">
                    {authError}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClearAuthError}
                className="text-amber-700 hover:text-amber-900 font-bold px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 transition cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {authErrorCode === 'auth/unauthorized-domain' && (
              <div className="p-3 rounded-xl bg-white border border-amber-200 text-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAF8F5] p-2.5 rounded-lg border border-[#DDD8CD]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-700">Tu dominio actual:</span>
                    <code className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-xs select-all">
                      {typeof window !== 'undefined' ? window.location.hostname : ''}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        copyText(window.location.hostname);
                      }
                    }}
                    className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition shrink-0"
                  >
                    <span>{isCopied ? '¡Copiado!' : 'Copiar Dominio'}</span>
                  </button>
                </div>

                <div className="space-y-1 text-[11.5px] text-slate-700">
                  <p className="font-semibold text-slate-900">Pasos para autorizarlo (solo se hace 1 vez):</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                    <li>Abre los ajustes de Firebase pulsando el botón azul de abajo.</li>
                    <li>En la pestaña <strong>Settings</strong>, baja a la sección <strong>Authorized domains</strong>.</li>
                    <li>Pulsa en <strong>Add domain</strong>, pega tu dominio copiado y pulsa <strong>Save</strong>.</li>
                  </ol>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href="https://console.firebase.google.com/project/true-charger-4smzh/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>🔗 Abrir Firebase Console (Settings)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onEnableLocalProfile('Mi Cartera (Local)')}
                    className="px-3 py-1.5 rounded-lg bg-[#EFECE4] hover:bg-[#E5E1D5] text-slate-800 font-semibold text-xs transition cursor-pointer"
                  >
                    👤 Continuar con Perfil en este Navegador
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4 Core Navigation Tabs */}
      <nav className="border-b border-[#E7E2D8] bg-[#F8F6F0] px-4 lg:px-8 mt-2">
        <div className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-4 overflow-x-auto py-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSection('watchlist')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'watchlist'
                ? 'bg-white text-emerald-800 font-bold border border-[#DDD8CD] shadow-xs'
                : 'text-slate-600 hover:text-[#191C21]'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-700" />
            <span>Mi Cartera</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('impact')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'impact'
                ? 'bg-white text-emerald-800 font-bold border border-[#DDD8CD] shadow-xs'
                : 'text-slate-600 hover:text-[#191C21]'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Impacto de Noticias</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('radar_gems')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'radar_gems'
                ? 'bg-white text-emerald-800 font-bold border border-[#DDD8CD] shadow-xs'
                : 'text-slate-600 hover:text-[#191C21]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Radar Oportunidades</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
              IA
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('events_opportunities')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'events_opportunities'
                ? 'bg-white text-emerald-800 font-bold border border-[#DDD8CD] shadow-xs'
                : 'text-slate-600 hover:text-[#191C21]'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-600" />
            <span>Eventos & Macro</span>
          </button>
        </div>
      </nav>
    </>
  );
};

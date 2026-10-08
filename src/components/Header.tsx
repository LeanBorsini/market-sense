/**
 * Header Component
 * 
 * Clean, synthesized navigation bar for both desktop and mobile:
 * - Brand identity
 * - User Profile & Google Session Manager
 * - Progressive Web App (PWA) install trigger
 * - Universal fundamental auditor & search input
 * - 4-Tab core view switcher (Mi Cartera, Impacto de Noticias, Radar Oportunidades, Eventos & Macro)
 */

import React from 'react';
import { 
  Search, 
  BarChart2, 
  HelpCircle, 
  Sparkles, 
  Globe, 
  FlaskConical,
  HardDrive,
  Shield,
  Lock
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ActiveSection } from '../types/market';

interface HeaderProps {
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
}

export const Header: React.FC<HeaderProps> = ({
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
}) => {
  return (
    <>
      <header className="border-b border-[#E7E2D8] bg-[#F8F6F0]/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          {/* Top Row: Brand & Account */}
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#191C21] text-[#FBF9F4] flex items-center justify-center font-bold font-mono text-sm shadow-sm">
                MS
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold text-[#191C21] tracking-tight font-serif">
                  MarketSense
                </span>
                <span className="text-[11px] text-slate-500 font-serif italic hidden sm:inline">
                  · Inteligencia Fundamental
                </span>
              </div>
            </div>

            {/* Quick Actions: PWA Install, Private Desk (Owner) & User Profile */}
            <div className="flex items-center gap-2">
              <PWAInstallButton />

              {/* Private Operator Desk (Isolated from public fundamental users) */}
              <button
                type="button"
                onClick={() => setActiveSection(activeSection === 'fedora_bot' ? 'watchlist' : 'fedora_bot')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                  activeSection === 'fedora_bot'
                    ? 'bg-amber-900 text-amber-100 border-amber-700 shadow-sm'
                    : 'bg-[#F2ECE1] hover:bg-[#EAE3D6] text-slate-700 border-[#DDD8CD]'
                }`}
                title="Consola Privada del Bot (Aislada de usuarios de fundamentales)"
              >
                <Lock className={`w-3.5 h-3.5 ${activeSection === 'fedora_bot' ? 'text-amber-300' : 'text-slate-500'}`} />
                <span className="hidden sm:inline text-[11px]">
                  {activeSection === 'fedora_bot' ? 'Cerrar Desk Privado' : 'Desk Privado'}
                </span>
              </button>

              {currentUser ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFECE4] border border-[#DDD8CD] text-xs">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt={currentUser.displayName || ''} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">
                      {currentUser.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <span className="font-semibold text-slate-800 hidden sm:inline max-w-[90px] truncate" title={currentUser.email || ''}>
                    {currentUser.displayName || 'Miembro'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onLogout()}
                    className="text-[11px] text-slate-500 hover:text-rose-600 transition ml-1 cursor-pointer"
                    title="Cerrar sesión"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onLoginWithGoogle()}
                  disabled={isLoggingIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-[#DDD8CD] text-xs font-semibold transition cursor-pointer shadow-2xs"
                  title="Guardar tus notas y cartera en tu cuenta"
                >
                  <span>{isLoggingIn ? 'Conectando...' : 'Acceder'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Universal Search & Auditor Input Bar */}
          <form onSubmit={onSearchSubmit} className="relative w-full">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar o auditar activo (ej. NVDA, VOO, BTC, SAN, OHLA)..."
                className="w-full pl-9 pr-24 py-2 rounded-xl bg-white border border-[#DDD8CD] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition shadow-2xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Auditar
              </button>
            </div>
          </form>

          {/* 4-Tab Core View Navigation Switcher */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs font-medium border-t border-[#EDE8DE] pt-2">
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
              <span className="text-[10px] px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-mono font-bold">
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
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Eventos & Macro</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('lab')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'lab'
                  ? 'bg-white text-emerald-800 font-bold border border-[#DDD8CD] shadow-xs'
                  : 'text-slate-600 hover:text-[#191C21]'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-teal-700" />
              <span>Laboratorio & Simulación</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Auth Error Banner with Local Offline Fallback */}
      {authError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span>{authError}</span>
          </div>
          <div className="flex items-center gap-2">
            {authErrorCode === 'auth/unauthorized-domain' && (
              <button
                type="button"
                onClick={() => onEnableLocalProfile('Miembro')}
                className="px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 font-semibold text-amber-950 transition cursor-pointer"
              >
                Activar Modo Local
              </button>
            )}
            <button
              type="button"
              onClick={onClearAuthError}
              className="text-amber-700 hover:text-amber-950 font-bold ml-1 cursor-pointer"
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

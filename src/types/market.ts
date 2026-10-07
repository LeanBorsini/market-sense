import { Asset, UserProfile, OpportunityScan, GemType } from '../data/assets';
import { MovementCause, DailyMacroImpact, CriticalEvent, GlobalMarketPulse } from '../data/marketSignals';
import { AsymmetryVisualMetrics } from '../components/AsymmetryVisualizer';

/**
 * Navigation tabs available across the MarketSense terminal.
 */
export type ActiveSection = 'watchlist' | 'impact' | 'radar_gems' | 'events_opportunities' | 'lab';

/**
 * Editorial Typography Theme Options:
 * - 'editorial_pluma': Cormorant Garamond (Classical quill, ink, historical bookbinding)
 * - 'prensa_financiera': Newsreader (The Financial Times & WSJ editorial elegance)
 * - 'moderno': Plus Jakarta Sans (Contemporary Swiss fintech minimalism)
 */
export type TypographyTheme = 'editorial_pluma' | 'prensa_financiera' | 'moderno';

/**
 * Filter for Radar scanning
 */
export type RadarGemFilter = 'todos' | 'small_cap_tech' | 'panic_turnaround' | 'niche_monopoly' | 'asia_ibkr';

/**
 * Standardized Live Market Quote object returned by `/api/market-prices`
 * or derived from user custom prices / static fallbacks.
 */
export interface LiveQuote {
  price: string;
  change: string;
  isPositive: boolean;
  isLive?: boolean;
  currency?: string;
  exchange?: string;
  rawPrice?: number;
}

export type LiveQuotesMap = Record<string, {
  ticker: string;
  price: string;
  rawPrice: number;
  change: string;
  isPositive: boolean;
  currency: string;
  exchange: string;
  lastUpdated: string;
}>;

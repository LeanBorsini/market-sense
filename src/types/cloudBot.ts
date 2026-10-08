export type TradeStatus = 'ACTIVE' | 'CLOSED_TP' | 'CLOSED_SL' | 'BREAKEVEN' | 'PENDING';
export type TradeDirection = 'BUY' | 'SELL';

export interface TradePostMortem {
  wasWickHunt: boolean;
  huntAmplitudePips?: number;
  detailedAnalysis: string; // "Por qué dio bien" o "Qué estuvo mal / por qué dio SL"
  lessonsLearned: string;
  cushionSavedTrade?: boolean;
  marketRegime: 'ALTA_VOLATILIDAD' | 'BARRIDO_FONDEO' | 'TENDENCIA_LIMPIA' | 'RANGO_LATERAL';
}

export interface DetailedTrade {
  id: string;
  ticket: string;
  timestamp: string;
  closeTimestamp?: string;
  symbol: string;
  direction: TradeDirection;
  strategyId: string;
  strategyName: string;
  status: TradeStatus;
  
  // Execution prices & metrics
  entryPrice: number;
  exitPrice?: number;
  slPrice: number;
  tpPrice: number;
  
  // Algorithmic risk & sizing
  slPips: number;
  tpPips: number;
  riskPercent: number; // e.g. 1.0%
  lotSize: number; // e.g. 0.42 lots
  riskAmountEur: number; // e.g. €100
  pnlEur?: number;
  pnlPct?: number;
  rMultiple?: number;
  
  // Prop firm & execution quality
  spreadAtEntryPips: number;
  slippagePips: number;
  antiHuntCushionPips: number;
  currentPrice?: number;
  floatingPnlEur?: number;
  floatingPnlPct?: number;
  
  // Detailed Observations & Journal
  entryRationale: string;
  exitReason?: string;
  postMortem?: TradePostMortem;
  operatorNotes?: string;
}

export interface EvolutionaryAdjustment {
  id: string;
  timestamp: string;
  symbol: string;
  triggerEvent: 'WICK_HUNT_DETECTED' | 'SPREAD_SPIKE_ABSORBED' | 'CLEAN_WIN_BOOST' | 'DRAWDOWN_PROTECT_ENGAGED';
  description: string;
  cushionBefore: number;
  cushionAfter: number;
  dynamicAtrFactor: number;
  actionTaken: string;
}

export interface CloudBotState {
  isRunning: boolean;
  lastTickTime: string;
  accountBalance: number;
  initialCapital: number;
  currency: string;
  
  // Real-time Floating Equity & Prop Firm Protection
  currentEquity: number;
  floatingPnlEur: number;
  floatingPnlPct: number;
  peakEquityToday: number;
  totalCommittedRiskPct: number;
  
  // Prop Firm Thresholds & Sentinel
  dailyDrawdownLimitPct: number; // e.g. 4.0% prop firm limit
  circuitBreakerThresholdPct: number; // e.g. 3.2% safe circuit breaker
  warningThresholdPct: number; // e.g. 2.0% throttle
  deriskThresholdPct: number; // e.g. 2.8% auto partial close
  calculationMode: 'BALANCE_BASED' | 'TRAILING_EQUITY'; // FTMO vs Apex
  totalDrawdownLimitPct: number; // e.g. 8.0% or 10.0%
  
  dailyPnlEur: number;
  dailyPnlPct: number;
  isDrawdownLocked: boolean;
  circuitBreakerTripped: boolean;
  circuitBreakerReason?: string;
  circuitBreakerTimestamp?: string;
  emergencyLiquidationsCount: number;
  
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  
  wickHuntsAvoided: number;
  wickHuntsDetected: number;
  antiHuntEfficiencyPct: number;
  
  cushionsBySymbol: Record<string, number>;
  activeOrders: DetailedTrade[];
  closedTrades: DetailedTrade[];
  evolutionLog: EvolutionaryAdjustment[];
}

export interface SizingCalculationRequest {
  symbol: string;
  balance: number;
  riskPercent: number; // e.g. 1.0%
}

export interface SizingCalculationResult {
  symbol: string;
  balance: number;
  riskPercent: number;
  riskAmount: number;
  currentPrice: number;
  atrPips: number;
  antiHuntCushionPips: number;
  spreadBufferPips: number;
  recommendedSlPips: number;
  calculatedLots: number;
  estimatedTpPips: number;
  riskRewardRatio: string;
  slPriceEstimateBuy: number;
  tpPriceEstimateBuy: number;
  algorithmExplanation: string;
}

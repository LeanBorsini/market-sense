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

export type AccountType = 'PROP_FIRM_EVAL' | 'PROP_FIRM_FUNDED' | 'BROKER_REAL' | 'BROKER_DEMO';

export interface TradingAccount {
  id: string;
  name: string; // e.g. "FTMO Challenge $100k"
  broker: string; // "FTMO", "FundedNext", "Topstep", "IC Markets", "Pepperstone", "Interactive Brokers"
  accountType: AccountType;
  accountNumber: string;
  server: string;
  currency: 'EUR' | 'USD' | 'GBP';
  initialCapital: number;
  balance: number;
  currentEquity: number;
  floatingPnlEur: number;
  floatingPnlPct: number;
  dailyPnlEur: number;
  dailyPnlPct: number;
  peakEquityToday: number;
  
  // Prop Firm Risk Rules
  dailyDrawdownLimitPct: number;
  circuitBreakerThresholdPct: number;
  warningThresholdPct: number;
  deriskThresholdPct: number;
  calculationMode: 'BALANCE_BASED' | 'TRAILING_EQUITY';
  totalDrawdownLimitPct: number;
  maxRiskPerTradePct: number;
  
  // Status
  isActive: boolean; // Trading enabled or paused on this account
  isDrawdownLocked: boolean;
  circuitBreakerTripped: boolean;
  circuitBreakerReason?: string;
  
  // Performance
  activeOrdersCount: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  profitFactor: number;
  netPnlEur: number;
  avgSlippagePips: number;
  tags: string[];
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
  accountId?: string;
  accountName?: string;
  broker?: string;
  
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

export interface StrategyRule {
  id: string;
  name: string;
  description: string;
  isMet: boolean;
  currentValue?: string;
}

export interface BotStrategyConfig {
  id: string;
  symbol: string;
  strategyName: string;
  category: 'LIQUIDITY_SWEEP' | 'TREND_PULLBACK' | 'SESSION_BREAKOUT' | 'VOLATILITY_EXPANSION' | 'MACRO_NEWS';
  timeframe: '1m' | '5m' | '15m' | '1h';
  direction: 'BUY' | 'SELL' | 'BOTH';
  riskPercent: number; // e.g. 1.0%
  isEnabled: boolean; // whether scanning for this strategy is active
  rules: StrategyRule[];
  status: 'ESPERANDO_CONDICIONES' | 'CONDICIONES_CUMPLIDAS' | 'EJECUTANDO_ORDEN' | 'EN_COOLDOWN';
  lastScanTimestamp: string;
  lastTriggerTimestamp?: string;
  tradesGenerated: number;
  winRatePct: number;
  antiHuntCushionPips: number;
}

export interface TickerTradingConfig {
  symbol: string;
  displayName: string;
  category: 'INDICE' | 'COMMODITY' | 'FOREX' | 'CRYPTO';
  isActive: boolean;
  triggerMode: 'ANY_TRIGGERS' | 'CONFLUENCE_ALL'; // "cuando alguna se cumple que entre" -> ANY_TRIGGERS
  maxConcurrentTrades: number;
  strategies: BotStrategyConfig[];
}

export interface LiveScannerLog {
  id: string;
  timestamp: string;
  symbol: string;
  strategyName?: string;
  type: 'SCAN' | 'EVALUATION' | 'TRIGGER' | 'EXECUTION' | 'SENTINEL_OK' | 'WARNING';
  message: string;
  latencyMs?: number;
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

  // Multi-Account & Multi-Broker Management
  accounts: TradingAccount[];
  activeAccountId: string;

  // Autonomous Ticker & Strategy Matrix
  tickerConfigs: TickerTradingConfig[];
  scannerLogs: LiveScannerLog[];
  ticksProcessedToday: number;
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
  slPriceEstimateSell?: number;
  tpPriceEstimateSell?: number;
  algorithmExplanation: string;
}

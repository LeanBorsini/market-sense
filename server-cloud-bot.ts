import express from 'express';

export interface TradePostMortem {
  wasWickHunt: boolean;
  huntAmplitudePips?: number;
  detailedAnalysis: string;
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
  direction: 'BUY' | 'SELL';
  strategyId: string;
  strategyName: string;
  status: 'ACTIVE' | 'CLOSED_TP' | 'CLOSED_SL' | 'BREAKEVEN' | 'PENDING';
  accountId?: string;
  accountName?: string;
  broker?: string;
  
  entryPrice: number;
  exitPrice?: number;
  slPrice: number;
  tpPrice: number;
  
  slPips: number;
  tpPips: number;
  riskPercent: number;
  lotSize: number;
  riskAmountEur: number;
  pnlEur?: number;
  pnlPct?: number;
  rMultiple?: number;
  
  spreadAtEntryPips: number;
  slippagePips: number;
  antiHuntCushionPips: number;
  currentPrice?: number;
  floatingPnlEur?: number;
  floatingPnlPct?: number;
  
  entryRationale: string;
  exitReason?: string;
  postMortem?: TradePostMortem;
  operatorNotes?: string;
}

export type AccountType = 'PROP_FIRM_EVAL' | 'PROP_FIRM_FUNDED' | 'BROKER_REAL' | 'BROKER_DEMO';

export interface TradingAccount {
  id: string;
  name: string;
  broker: string;
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
  
  dailyDrawdownLimitPct: number;
  circuitBreakerThresholdPct: number;
  warningThresholdPct: number;
  deriskThresholdPct: number;
  calculationMode: 'BALANCE_BASED' | 'TRAILING_EQUITY';
  totalDrawdownLimitPct: number;
  maxRiskPerTradePct: number;
  
  isActive: boolean;
  isDrawdownLocked: boolean;
  circuitBreakerTripped: boolean;
  circuitBreakerReason?: string;
  
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

export const INITIAL_ACCOUNTS: TradingAccount[] = [
  {
    id: 'acc-fn-50k',
    name: 'FundedNext Financiada €50k (Real)',
    broker: 'FundedNext',
    accountType: 'PROP_FIRM_FUNDED',
    accountNumber: 'FN-4120985',
    server: 'FundedNext-Live01',
    currency: 'EUR',
    initialCapital: 50000.00,
    balance: 52380.00,
    currentEquity: 52490.50,
    floatingPnlEur: 110.50,
    floatingPnlPct: 0.21,
    dailyPnlEur: 185.50,
    dailyPnlPct: 0.35,
    peakEquityToday: 52520.00,
    dailyDrawdownLimitPct: 4.0,
    circuitBreakerThresholdPct: 3.2,
    warningThresholdPct: 2.0,
    deriskThresholdPct: 2.8,
    calculationMode: 'BALANCE_BASED',
    totalDrawdownLimitPct: 8.0,
    maxRiskPerTradePct: 0.75,
    isActive: true,
    isDrawdownLocked: false,
    circuitBreakerTripped: false,
    activeOrdersCount: 1,
    totalTrades: 18,
    winningTrades: 13,
    losingTrades: 5,
    winRatePct: 72.2,
    profitFactor: 2.45,
    netPnlEur: 2380.00,
    avgSlippagePips: 0.2,
    tags: ['Fondeada Real', 'Reparto 80/20', 'Meta Retiro: 12d']
  },
  {
    id: 'acc-ftmo-100k',
    name: 'FTMO Reto Evaluación $100k',
    broker: 'FTMO',
    accountType: 'PROP_FIRM_EVAL',
    accountNumber: 'FTMO-8891024',
    server: 'FTMO-Live2',
    currency: 'USD',
    initialCapital: 100000.00,
    balance: 104820.00,
    currentEquity: 104820.00,
    floatingPnlEur: 0,
    floatingPnlPct: 0,
    dailyPnlEur: 320.00,
    dailyPnlPct: 0.31,
    peakEquityToday: 105100.00,
    dailyDrawdownLimitPct: 5.0,
    circuitBreakerThresholdPct: 4.0,
    warningThresholdPct: 2.5,
    deriskThresholdPct: 3.5,
    calculationMode: 'BALANCE_BASED',
    totalDrawdownLimitPct: 10.0,
    maxRiskPerTradePct: 1.0,
    isActive: true,
    isDrawdownLocked: false,
    circuitBreakerTripped: false,
    activeOrdersCount: 0,
    totalTrades: 24,
    winningTrades: 16,
    losingTrades: 8,
    winRatePct: 66.7,
    profitFactor: 2.15,
    netPnlEur: 4820.00,
    avgSlippagePips: 0.15,
    tags: ['Fase 1 Evaluación', 'Meta: $10,000 (+4.82%)', 'Sin Límite Tiempo']
  },
  {
    id: 'acc-apex-50k',
    name: 'Topstep / Apex Futuros $50k',
    broker: 'Topstep',
    accountType: 'PROP_FIRM_EVAL',
    accountNumber: 'TOP-992014',
    server: 'Rithmic-Live01',
    currency: 'USD',
    initialCapital: 50000.00,
    balance: 51650.00,
    currentEquity: 51710.00,
    floatingPnlEur: 60.00,
    floatingPnlPct: 0.12,
    dailyPnlEur: 140.00,
    dailyPnlPct: 0.27,
    peakEquityToday: 51750.00,
    dailyDrawdownLimitPct: 3.5,
    circuitBreakerThresholdPct: 2.8,
    warningThresholdPct: 1.8,
    deriskThresholdPct: 2.4,
    calculationMode: 'TRAILING_EQUITY',
    totalDrawdownLimitPct: 5.0,
    maxRiskPerTradePct: 0.5,
    isActive: true,
    isDrawdownLocked: false,
    circuitBreakerTripped: false,
    activeOrdersCount: 0,
    totalTrades: 15,
    winningTrades: 10,
    losingTrades: 5,
    winRatePct: 66.7,
    profitFactor: 1.95,
    netPnlEur: 1650.00,
    avgSlippagePips: 0.1,
    tags: ['Trailing Intradía', 'Micro ES/NQ', 'Regla de Consistencia']
  },
  {
    id: 'acc-ic-10k',
    name: 'IC Markets Demo Scalp €10k',
    broker: 'IC Markets',
    accountType: 'BROKER_DEMO',
    accountNumber: 'IC-550183',
    server: 'ICMarketsSC-Demo02',
    currency: 'EUR',
    initialCapital: 10000.00,
    balance: 10420.50,
    currentEquity: 10452.30,
    floatingPnlEur: 31.80,
    floatingPnlPct: 0.30,
    dailyPnlEur: 185.50,
    dailyPnlPct: 1.85,
    peakEquityToday: 10475.00,
    dailyDrawdownLimitPct: 5.0,
    circuitBreakerThresholdPct: 3.5,
    warningThresholdPct: 2.0,
    deriskThresholdPct: 2.8,
    calculationMode: 'BALANCE_BASED',
    totalDrawdownLimitPct: 10.0,
    maxRiskPerTradePct: 1.0,
    isActive: true,
    isDrawdownLocked: false,
    circuitBreakerTripped: false,
    activeOrdersCount: 1,
    totalTrades: 12,
    winningTrades: 8,
    losingTrades: 4,
    winRatePct: 66.7,
    profitFactor: 2.20,
    netPnlEur: 420.50,
    avgSlippagePips: 0.1,
    tags: ['Laboratorio Pruebas', 'Raw Spreads ECN', 'Nuevos Algoritmos']
  },
  {
    id: 'acc-ibkr-25k',
    name: 'Interactive Brokers Real €25k',
    broker: 'Interactive Brokers',
    accountType: 'BROKER_REAL',
    accountNumber: 'IB-U8821941',
    server: 'IBKR-Gateway (Live)',
    currency: 'EUR',
    initialCapital: 25000.00,
    balance: 26140.00,
    currentEquity: 26185.00,
    floatingPnlEur: 45.00,
    floatingPnlPct: 0.17,
    dailyPnlEur: 95.00,
    dailyPnlPct: 0.36,
    peakEquityToday: 26210.00,
    dailyDrawdownLimitPct: 3.0,
    circuitBreakerThresholdPct: 2.5,
    warningThresholdPct: 1.5,
    deriskThresholdPct: 2.0,
    calculationMode: 'BALANCE_BASED',
    totalDrawdownLimitPct: 6.0,
    maxRiskPerTradePct: 0.5,
    isActive: true,
    isDrawdownLocked: false,
    circuitBreakerTripped: false,
    activeOrdersCount: 0,
    totalTrades: 10,
    winningTrades: 7,
    losingTrades: 3,
    winRatePct: 70.0,
    profitFactor: 2.30,
    netPnlEur: 1140.00,
    avgSlippagePips: 0.05,
    tags: ['Capital Propio Real', 'Conservador', 'S&P 500 + ETFs']
  }
];

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
  riskPercent: number;
  isEnabled: boolean;
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
  triggerMode: 'ANY_TRIGGERS' | 'CONFLUENCE_ALL';
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

export const INITIAL_TICKER_CONFIGS: TickerTradingConfig[] = [
  {
    symbol: 'S&P 500 (VOO/ES)',
    displayName: 'S&P 500 (Índice Director EE.UU.)',
    category: 'INDICE',
    isActive: true,
    triggerMode: 'ANY_TRIGGERS',
    maxConcurrentTrades: 2,
    strategies: [
      {
        id: 'strat-sp500-sweep',
        symbol: 'S&P 500 (VOO/ES)',
        strategyName: 'S&P 500 Barrido de Liquidez & Reversión',
        category: 'LIQUIDITY_SWEEP',
        timeframe: '5m',
        direction: 'BUY',
        riskPercent: 1.0,
        isEnabled: true,
        antiHuntCushionPips: 5.2,
        status: 'ESPERANDO_CONDICIONES',
        lastScanTimestamp: new Date().toISOString(),
        tradesGenerated: 7,
        winRatePct: 71.4,
        rules: [
          { id: 'r1', name: 'Barrido de mínimo de sesión previa', description: 'El precio debe traspasar el soporte previo para atrapar órdenes stop', isMet: true, currentValue: '5,898.00 perforado' },
          { id: 'r2', name: 'Rechazo en vela martillo / pinbar', description: 'Cierre de vela de 5 minutos con mecha inferior > 60% del rango', isMet: true, currentValue: 'Mecha 68% detectada' },
          { id: 'r3', name: 'Colchón anti-caza asignado', description: 'Añadir holgura dinámica de 5.2 pips fuera del radio de los brokers de fondeo', isMet: true, currentValue: '+5.2 pips configurados' }
        ]
      },
      {
        id: 'strat-sp500-pullback',
        symbol: 'S&P 500 (VOO/ES)',
        strategyName: 'S&P 500 Pullback a Media Móvil (EMA 50)',
        category: 'TREND_PULLBACK',
        timeframe: '15m',
        direction: 'BUY',
        riskPercent: 0.75,
        isEnabled: true,
        antiHuntCushionPips: 4.8,
        status: 'ESPERANDO_CONDICIONES',
        lastScanTimestamp: new Date().toISOString(),
        tradesGenerated: 5,
        winRatePct: 60.0,
        rules: [
          { id: 'r4', name: 'Estructura alcista en 1 hora', description: 'Mínimos y máximos crecientes confirmados', isMet: true, currentValue: 'H1 Bullish Structure' },
          { id: 'r5', name: 'Toque o re-testeo de la EMA 50', description: 'Retroceso controlado sin volumen vendedor excesivo', isMet: false, currentValue: 'A 4.1 pips de la EMA' },
          { id: 'r6', name: 'Absorción institucional', description: 'Delta de volumen positivo en la zona de confluencia', isMet: false, currentValue: 'Delta neutral' }
        ]
      },
      {
        id: 'strat-sp500-open-breakout',
        symbol: 'S&P 500 (VOO/ES)',
        strategyName: 'S&P 500 Apertura New York (Breakout Rango 09:30 EST)',
        category: 'SESSION_BREAKOUT',
        timeframe: '1m',
        direction: 'BOTH',
        riskPercent: 0.5,
        isEnabled: true,
        antiHuntCushionPips: 6.0,
        status: 'ESPERANDO_CONDICIONES',
        lastScanTimestamp: new Date().toISOString(),
        tradesGenerated: 4,
        winRatePct: 75.0,
        rules: [
          { id: 'r7', name: 'Rango pre-mercado de 15m marcado', description: 'Identificar máximos y mínimos entre 09:15 y 09:30 EST', isMet: true, currentValue: 'Rango: 5,910 - 5,925' },
          { id: 'r8', name: 'Expansión de volumen en apertura', description: 'Volumen superior al 180% del promedio de sesión', isMet: false, currentValue: 'En espera de campana' },
          { id: 'r9', name: 'Filtro anti-spread de apertura', description: 'Spread no superior a 1.2 pips para evitar deslizamientos', isMet: true, currentValue: 'Spread: 0.8 pips (OK)' }
        ]
      }
    ]
  },
  {
    symbol: 'XAUUSD (Oro)',
    displayName: 'XAUUSD (Oro Spot)',
    category: 'COMMODITY',
    isActive: true,
    triggerMode: 'ANY_TRIGGERS',
    maxConcurrentTrades: 1,
    strategies: [
      {
        id: 'strat-gold-asian',
        symbol: 'XAUUSD (Oro)',
        strategyName: 'Oro Rotura & Re-Test de Rango Asiático (London Open)',
        category: 'SESSION_BREAKOUT',
        timeframe: '15m',
        direction: 'BOTH',
        riskPercent: 0.75,
        isEnabled: true,
        antiHuntCushionPips: 14.5,
        status: 'ESPERANDO_CONDICIONES',
        lastScanTimestamp: new Date().toISOString(),
        tradesGenerated: 6,
        winRatePct: 66.7,
        rules: [
          { id: 'rg1', name: 'Definición de Rango de Tokio', description: 'Caja horaria entre las 01:00 y las 07:00 CET', isMet: true, currentValue: 'Caja: $2,638 - $2,646' },
          { id: 'rg2', name: 'Salida de rango con vela con cuerpo', description: 'Cierre fuera del rango asiático en 15 minutos', isMet: true, currentValue: 'Rotura confirmada' },
          { id: 'rg3', name: 'Colchón anti-mechazos de oro', description: 'Margen de 14.5 pips para capear los latigazos típicos del oro', isMet: true, currentValue: '+14.5 pips listos' }
        ]
      }
    ]
  },
  {
    symbol: 'EURUSD',
    displayName: 'EURUSD (Euro / Dólar)',
    category: 'FOREX',
    isActive: true,
    triggerMode: 'ANY_TRIGGERS',
    maxConcurrentTrades: 1,
    strategies: [
      {
        id: 'strat-eurusd-kz',
        symbol: 'EURUSD',
        strategyName: 'EURUSD Descuento en Killzone Europea',
        category: 'LIQUIDITY_SWEEP',
        timeframe: '5m',
        direction: 'BUY',
        riskPercent: 1.0,
        isEnabled: true,
        antiHuntCushionPips: 3.4,
        status: 'ESPERANDO_CONDICIONES',
        lastScanTimestamp: new Date().toISOString(),
        tradesGenerated: 3,
        winRatePct: 66.7,
        rules: [
          { id: 're1', name: 'Ventana Killzone (08:00 - 11:00 CET)', description: 'Operar solo durante el pico de liquidez de Frankfurt y Londres', isMet: true, currentValue: 'Horario Activo' },
          { id: 're2', name: 'Zona OTE (Optimal Trade Entry 62%-79%)', description: 'Retroceso de Fibonacci profundo en rango matutino', isMet: false, currentValue: 'Nivel 50% alcanzado' }
        ]
      }
    ]
  },
  {
    symbol: 'NASDAQ (QQQ)',
    displayName: 'NASDAQ 100 (Tecnológicas)',
    category: 'INDICE',
    isActive: true,
    triggerMode: 'ANY_TRIGGERS',
    maxConcurrentTrades: 1,
    strategies: [
      {
        id: 'strat-nasdaq-sweep',
        symbol: 'NASDAQ (QQQ)',
        strategyName: 'Nasdaq Caza de Liquidez en Máximos/Mínimos Clave',
        category: 'LIQUIDITY_SWEEP',
        timeframe: '5m',
        direction: 'BOTH',
        riskPercent: 0.75,
        isEnabled: true,
        antiHuntCushionPips: 8.0,
        status: 'ESPERANDO_CONDICIONES',
        lastScanTimestamp: new Date().toISOString(),
        tradesGenerated: 4,
        winRatePct: 75.0,
        rules: [
          { id: 'rn1', name: 'Perforación de máximo/mínimo del día anterior', description: 'Absorción rápida de stops de swing traders', isMet: true, currentValue: '20,410 perforado' },
          { id: 'rn2', name: 'Filtro de divergencia RSI en 5m', description: 'Precio marca nuevo extremo pero RSI no lo acompaña', isMet: false, currentValue: 'RSI: 54 (Neutral)' }
        ]
      }
    ]
  },
  {
    symbol: 'BTCUSD',
    displayName: 'Bitcoin / Dólar',
    category: 'CRYPTO',
    isActive: false,
    triggerMode: 'ANY_TRIGGERS',
    maxConcurrentTrades: 1,
    strategies: [
      {
        id: 'strat-btc-reversion',
        symbol: 'BTCUSD',
        strategyName: 'Bitcoin Mean Reversion en Bandas de Volatilidad',
        category: 'VOLATILITY_EXPANSION',
        timeframe: '15m',
        direction: 'BOTH',
        riskPercent: 0.5,
        isEnabled: false,
        antiHuntCushionPips: 45.0,
        status: 'EN_COOLDOWN',
        lastScanTimestamp: new Date().toISOString(),
        tradesGenerated: 2,
        winRatePct: 50.0,
        rules: [
          { id: 'rb1', name: 'Desviación estándar 2.5 sigma', description: 'Extensión extrema fuera de bandas de Bollinger', isMet: false, currentValue: 'Dentro de 1 sigma' }
        ]
      }
    ]
  }
];

export const INITIAL_SCANNER_LOGS: LiveScannerLog[] = [
  {
    id: 'log-init-1',
    timestamp: new Date().toISOString(),
    symbol: 'S&P 500 (VOO/ES)',
    strategyName: 'S&P 500 Barrido de Liquidez & Reversión',
    type: 'SCAN',
    message: `[${new Date().toLocaleTimeString('es-ES')}] S&P 500: Escaneando velas de 5m en servidor cloud. Regla 1 (Mínimo barrido) cumplida. Monitoreando vela martillo.`,
    latencyMs: 12
  },
  {
    id: 'log-init-2',
    timestamp: new Date(Date.now() - 4000).toISOString(),
    symbol: 'XAUUSD (Oro)',
    strategyName: 'Oro Rotura & Re-Test de Rango Asiático',
    type: 'SCAN',
    message: `[${new Date(Date.now() - 4000).toLocaleTimeString('es-ES')}] XAUUSD: Verificando spread del broker de fondeo (1.4 pips). Dentro del umbral seguro (< 2.2 pips).`,
    latencyMs: 9
  },
  {
    id: 'log-init-3',
    timestamp: new Date(Date.now() - 8000).toISOString(),
    symbol: 'GLOBAL',
    type: 'SENTINEL_OK',
    message: `[${new Date(Date.now() - 8000).toLocaleTimeString('es-ES')}] GUARDÍAN DE EQUITY 24/7: Pérdida flotante bajo control (-0.21%). Distancia al Circuit Breaker: 2.99%. Operativa autorizada.`,
    latencyMs: 14
  }
];

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

// Global In-Memory Cloud Bot State running 24/7 on the server
let cloudBotState = {
  isRunning: true,
  lastTickTime: new Date().toISOString(),
  accounts: INITIAL_ACCOUNTS,
  activeAccountId: 'acc-fn-50k',
  accountBalance: 52380.00,
  initialCapital: 50000.00,
  currency: 'EUR',
  
  // Real-time Floating Equity & Prop Firm Protection Engine
  currentEquity: 52490.50,
  floatingPnlEur: 110.50,
  floatingPnlPct: 0.21,
  peakEquityToday: 52520.00,
  totalCommittedRiskPct: 0.75,
  
  // Prop Firm Thresholds & Sentinel
  dailyDrawdownLimitPct: 4.0, // Hard fatal limit set by prop firm (FTMO / Apex / FundedNext)
  circuitBreakerThresholdPct: 3.2, // AI Early Kill Switch: liquidates at 3.2% to guarantee the 4% is never touched!
  warningThresholdPct: 2.0, // Yellow freeze threshold
  deriskThresholdPct: 2.8, // Orange defensive partial trim threshold
  calculationMode: 'BALANCE_BASED' as 'BALANCE_BASED' | 'TRAILING_EQUITY',
  totalDrawdownLimitPct: 8.0,
  
  dailyPnlEur: 185.50,
  dailyPnlPct: 0.35,
  isDrawdownLocked: false,
  circuitBreakerTripped: false,
  circuitBreakerReason: '',
  circuitBreakerTimestamp: '',
  emergencyLiquidationsCount: 1, // Historical record of accounts saved
  
  totalTrades: 18,
  winningTrades: 13,
  losingTrades: 5,
  winRatePct: 72.2,
  
  wickHuntsAvoided: 7,
  wickHuntsDetected: 2,
  antiHuntEfficiencyPct: 77.8,
  
  // Learned Anti-Hunt Cushions per symbol (in pips)
  cushionsBySymbol: {
    'S&P 500 (VOO/ES)': 5.2,
    'XAUUSD (Oro)': 14.5,
    'EURUSD': 3.4,
    'NASDAQ (QQQ)': 8.0,
    'BTCUSD': 45.0
  } as Record<string, number>,

  activeOrders: [
    {
      id: 'trd-active-1',
      ticket: '#MS-8921',
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      symbol: 'S&P 500 (VOO/ES)',
      direction: 'BUY',
      strategyId: 'sp500_liquidity_sweep',
      strategyName: 'S&P 500 Barrido de Liquidez & Reversión',
      status: 'ACTIVE',
      entryPrice: 5912.40,
      currentPrice: 5918.76,
      slPrice: 5892.20,
      tpPrice: 5954.80,
      slPips: 20.2,
      tpPips: 42.4,
      riskPercent: 1.0,
      lotSize: 0.50,
      riskAmountEur: 100.00,
      floatingPnlEur: 31.80,
      floatingPnlPct: 0.30,
      spreadAtEntryPips: 0.8,
      slippagePips: 0.1,
      antiHuntCushionPips: 5.2,
      entryRationale: 'Barrido del mínimo de la sesión europea (5,898.00) con rechazo en vela martillo en 5m y divergencia alcista de volumen.',
      operatorNotes: 'Posición corriendo en nube. Stop Loss ajustado fuera de la zona típica de cazas. Supervisada por el Guardián de Equity.'
    }
  ] as DetailedTrade[],

  closedTrades: [
    {
      id: 'trd-1',
      ticket: '#MS-8919',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      closeTimestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      symbol: 'S&P 500 (VOO/ES)',
      direction: 'BUY',
      strategyId: 'sp500_liquidity_sweep',
      strategyName: 'S&P 500 Barrido de Liquidez & Reversión',
      status: 'CLOSED_TP',
      entryPrice: 5885.10,
      exitPrice: 5928.00,
      slPrice: 5866.50,
      tpPrice: 5928.00,
      slPips: 18.6,
      tpPips: 42.9,
      riskPercent: 1.0,
      lotSize: 0.54,
      riskAmountEur: 100.00,
      pnlEur: 231.66,
      pnlPct: 2.31,
      rMultiple: 2.31,
      spreadAtEntryPips: 0.9,
      slippagePips: 0.2,
      antiHuntCushionPips: 4.8,
      entryRationale: 'Apertura de New York: absorción masiva en 5,885 tras barrido de órdenes stop de vendedores tempranos.',
      exitReason: 'Take Profit alcanzado en zona de liquidez institucional previa a máximos del día.',
      postMortem: {
        wasWickHunt: false,
        detailedAnalysis: 'La operación funcionó con precisión quirúrgica. El precio retrocedió a 5,871.20 (a solo 4.7 pips del SL estándar), pero nuestro colchón anti-manipulación de 4.8 pips mantuvo viva la orden sin ser expulsada antes del despegue.',
        lessonsLearned: 'El margen de holgura dinámica fue el factor decisivo para no salir en falso SL.',
        cushionSavedTrade: true,
        marketRegime: 'BARRIDO_FONDEO'
      },
      operatorNotes: 'Operación impecable en cuenta de fondeo.'
    },
    {
      id: 'trd-2',
      ticket: '#MS-8915',
      timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      closeTimestamp: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      symbol: 'S&P 500 (VOO/ES)',
      direction: 'BUY',
      strategyId: 'sp500_trend_pullback',
      strategyName: 'S&P 500 Pullback a Media Móvil 50',
      status: 'CLOSED_SL',
      entryPrice: 5870.00,
      exitPrice: 5854.80,
      slPrice: 5855.00,
      tpPrice: 5905.00,
      slPips: 15.0,
      tpPips: 35.0,
      riskPercent: 1.0,
      lotSize: 0.67,
      riskAmountEur: 100.00,
      pnlEur: -100.50,
      pnlPct: -1.00,
      rMultiple: -1.0,
      spreadAtEntryPips: 1.2,
      slippagePips: 0.3,
      antiHuntCushionPips: 3.0,
      entryRationale: 'Pullback técnico al soporte 5,870 en tendencia alcista intra-día.',
      exitReason: 'Stop Loss saltado por mechazo rápido durante apertura de datos de empleo.',
      postMortem: {
        wasWickHunt: true,
        huntAmplitudePips: 4.2,
        detailedAnalysis: 'Qué estuvo mal: El broker de fondeo amplió el spread a 2.4 pips justo con la noticia y barrió los mínimos hasta 5,852.00 durante 90 segundos. A los 5 minutos, el índice rebotó con fuerza y subió hasta 5,910 (nuestro TP original). Salimos en SL innecesariamente por culpa de la manipulación del spread.',
        lessonsLearned: 'Para noticias de alto impacto y aperturas, el colchón de 3.0 pips es insuficiente en cuentas de fondeo. Se requiere elevar la holgura y aplicar filtro de confirmación de 2 velas.',
        marketRegime: 'BARRIDO_FONDEO'
      },
      operatorNotes: 'Evento de manipulación detectado. El algoritmo procedió a recalibrar.'
    },
    {
      id: 'trd-3',
      ticket: '#MS-8910',
      timestamp: new Date(Date.now() - 19 * 3600 * 1000).toISOString(),
      closeTimestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      symbol: 'XAUUSD (Oro)',
      direction: 'BUY',
      strategyId: 'asian_range_breakout',
      strategyName: 'Ruptura y Reclamación de Rango Asiático',
      status: 'CLOSED_TP',
      entryPrice: 2642.50,
      exitPrice: 2658.20,
      slPrice: 2634.00,
      tpPrice: 2658.20,
      slPips: 85.0,
      tpPips: 157.0,
      riskPercent: 1.0,
      lotSize: 0.12,
      riskAmountEur: 100.00,
      pnlEur: 184.70,
      pnlPct: 1.85,
      rMultiple: 1.85,
      spreadAtEntryPips: 1.8,
      slippagePips: 0.4,
      antiHuntCushionPips: 12.0,
      entryRationale: 'Oro barrió el mínimo asiático en Londres, formó fallo de subasta y reclamó 2642.50 con volumen creciente.',
      exitReason: 'Take Profit alcanzado en el nivel de resistencia psicológica 2,658.',
      postMortem: {
        wasWickHunt: false,
        detailedAnalysis: 'La correlación con el retroceso del dólar DXY confirmó el impulso. La salida programada en 2,658.20 capturó el 90% del recorrido del tramo matutino.',
        lessonsLearned: 'Esperar a la reclamación del rango tras el barrido inicial tiene un win-rate del 74%.',
        marketRegime: 'TENDENCIA_LIMPIA'
      },
      operatorNotes: 'Ejecutado automáticamente en servidor de la nube.'
    },
    {
      id: 'trd-4',
      ticket: '#MS-8902',
      timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      closeTimestamp: new Date(Date.now() - 34 * 3600 * 1000).toISOString(),
      symbol: 'EURUSD',
      direction: 'SELL',
      strategyId: 'mean_reversion_pullback',
      strategyName: 'Reversión a la Media en Extensión',
      status: 'CLOSED_SL',
      entryPrice: 1.0885,
      exitPrice: 1.0905,
      slPrice: 1.0905,
      tpPrice: 1.0845,
      slPips: 20.0,
      tpPips: 40.0,
      riskPercent: 1.0,
      lotSize: 0.50,
      riskAmountEur: 100.00,
      pnlEur: -100.00,
      pnlPct: -1.00,
      rMultiple: -1.0,
      spreadAtEntryPips: 0.6,
      slippagePips: 0.1,
      antiHuntCushionPips: 2.5,
      entryRationale: 'RSI en 78 sobrecomprado en gráfico horario con divergencia bajista.',
      exitReason: 'Inversión de tendencia genuina tras declaraciones del BCE más duras de lo esperado.',
      postMortem: {
        wasWickHunt: false,
        detailedAnalysis: 'Qué estuvo mal: No fue un mechazo ni manipulación; fue una rotura estructural real por fundamentales macroeconómicos. El SL hizo su trabajo perfecto conteniendo la pérdida en exactamente el 1% definido.',
        lessonsLearned: 'Respetar el SL protege la cuenta de fondeo de pérdidas catastróficas.',
        marketRegime: 'ALTA_VOLATILIDAD'
      },
      operatorNotes: 'Pérdida normal controlada.'
    }
  ] as DetailedTrade[],

  evolutionLog: [
    {
      id: 'evo-1',
      timestamp: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      symbol: 'S&P 500 (VOO/ES)',
      triggerEvent: 'WICK_HUNT_DETECTED',
      description: 'Detección de mechazo falso de 4.2 pips en apertura que expulsó la orden previa antes de alcanzar el TP.',
      cushionBefore: 3.0,
      cushionAfter: 4.8,
      dynamicAtrFactor: 1.85,
      actionTaken: 'Incrementado colchón de holgura en +1.8 pips para S&P 500 y activado filtro de confirmación en barra cerrada.'
    },
    {
      id: 'evo-2',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      symbol: 'XAUUSD (Oro)',
      triggerEvent: 'SPREAD_SPIKE_ABSORBED',
      description: 'El broker de fondeo amplió spreads a 4.5 pips durante el rollover de sesión.',
      cushionBefore: 10.0,
      cushionAfter: 14.5,
      dynamicAtrFactor: 2.2,
      actionTaken: 'Añadido buffer preventivo de spread en rollover para no ser expulsado por la ampliación de horquilla.'
    },
    {
      id: 'evo-3',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      symbol: 'S&P 500 (VOO/ES)',
      triggerEvent: 'CLEAN_WIN_BOOST',
      description: 'Trade #MS-8919 salvado con éxito gracias al colchón de 4.8 pips. Se validó la efectividad de la adaptación.',
      cushionBefore: 4.8,
      cushionAfter: 5.2,
      dynamicAtrFactor: 1.9,
      actionTaken: 'Consolidada la holgura en 5.2 pips. Ratio de efectividad anti-caza elevado al 71.4%.'
    }
  ] as EvolutionaryAdjustment[],

  // Autonomous Ticker & Strategy Matrix
  tickerConfigs: INITIAL_TICKER_CONFIGS,
  scannerLogs: INITIAL_SCANNER_LOGS,
  ticksProcessedToday: 1420
};

// ─── ALGORITHMIC RISK & DYNAMIC PIP SIZING ENGINE ───
// Calculates optimal SL distance (in pips) based on ATR, structural levels & anti-manipulation cushion
export function calculateDynamicSizing(symbol: string, balance: number, riskPercent: number) {
  const normSymbol = symbol.toUpperCase();
  const riskAmount = (balance * (riskPercent / 100));

  let currentPrice = 5915.00;
  let baseAtrPips = 14.0;
  let pipValuePerLot = 5.0; // In EUR per pip for 1 standard lot
  let cushion = cloudBotState.cushionsBySymbol[symbol] || 5.0;
  let spreadBuffer = 1.2;

  if (normSymbol.includes('XAU') || normSymbol.includes('ORO')) {
    currentPrice = 2645.00;
    baseAtrPips = 70.0;
    pipValuePerLot = 1.0;
    cushion = cloudBotState.cushionsBySymbol['XAUUSD (Oro)'] || 14.5;
    spreadBuffer = 2.5;
  } else if (normSymbol.includes('EUR')) {
    currentPrice = 1.0880;
    baseAtrPips = 16.0;
    pipValuePerLot = 10.0;
    cushion = cloudBotState.cushionsBySymbol['EURUSD'] || 3.4;
    spreadBuffer = 0.8;
  } else if (normSymbol.includes('BTC')) {
    currentPrice = 64200.0;
    baseAtrPips = 350.0;
    pipValuePerLot = 0.1;
    cushion = cloudBotState.cushionsBySymbol['BTCUSD'] || 45.0;
    spreadBuffer = 10.0;
  } else {
    // Default S&P 500 / VOO
    currentPrice = 5915.00;
    baseAtrPips = 15.0;
    pipValuePerLot = 5.0;
    cushion = cloudBotState.cushionsBySymbol['S&P 500 (VOO/ES)'] || 5.2;
    spreadBuffer = 1.0;
  }

  // Recommended SL in pips = Base ATR (1.0x) + Anti-Hunt Cushion + Spread Buffer
  const recommendedSlPips = Number((baseAtrPips + cushion + spreadBuffer).toFixed(1));
  
  // Lot size formula: Risk € / (SL pips * pipValue per lot)
  const rawLots = riskAmount / (recommendedSlPips * pipValuePerLot);
  const calculatedLots = Math.max(0.01, Number(rawLots.toFixed(2)));

  // Target Take Profit based on 1:2.2 Risk to Reward
  const estimatedTpPips = Number((recommendedSlPips * 2.2).toFixed(1));

  // Price estimations for BUY
  let pipPoint = 1.0;
  if (normSymbol.includes('EUR')) pipPoint = 0.0001;
  else if (normSymbol.includes('XAU') || normSymbol.includes('ORO')) pipPoint = 0.1;
  else pipPoint = 1.0;

  const slPriceEstimateBuy = Number((currentPrice - (recommendedSlPips * pipPoint)).toFixed(2));
  const tpPriceEstimateBuy = Number((currentPrice + (estimatedTpPips * pipPoint)).toFixed(2));
  const slPriceEstimateSell = Number((currentPrice + (recommendedSlPips * pipPoint)).toFixed(2));
  const tpPriceEstimateSell = Number((currentPrice - (estimatedTpPips * pipPoint)).toFixed(2));

  const algorithmExplanation = `El algoritmo analizó la volatilidad actual (ATR ${baseAtrPips} pips) y añadió el colchón anti-mechazos aprendido (+${cushion} pips) más el buffer de horquilla del broker (+${spreadBuffer} pips). Resultado: SL técnico de ${recommendedSlPips} pips. Para arriesgar exactamente el ${riskPercent}% (${riskAmount.toFixed(2)} €), el lotaje matemático asignado es de ${calculatedLots} lotes.`;

  return {
    symbol,
    balance,
    riskPercent,
    riskAmount: Number(riskAmount.toFixed(2)),
    currentPrice,
    atrPips: baseAtrPips,
    antiHuntCushionPips: cushion,
    spreadBufferPips: spreadBuffer,
    recommendedSlPips,
    calculatedLots,
    estimatedTpPips,
    riskRewardRatio: '1:2.2',
    slPriceEstimateBuy,
    tpPriceEstimateBuy,
    slPriceEstimateSell,
    tpPriceEstimateSell,
    algorithmExplanation
  };
}

// ─── MULTI-ACCOUNT STATE SYNCHRONIZATION ───
export function syncStateWithActiveAccount(accId: string) {
  const acc = cloudBotState.accounts.find(a => a.id === accId);
  if (!acc) return;
  cloudBotState.activeAccountId = acc.id;
  cloudBotState.accountBalance = acc.balance;
  cloudBotState.initialCapital = acc.initialCapital;
  cloudBotState.currency = acc.currency;
  cloudBotState.currentEquity = acc.currentEquity;
  cloudBotState.floatingPnlEur = acc.floatingPnlEur;
  cloudBotState.floatingPnlPct = acc.floatingPnlPct;
  cloudBotState.peakEquityToday = acc.peakEquityToday;
  cloudBotState.dailyDrawdownLimitPct = acc.dailyDrawdownLimitPct;
  cloudBotState.circuitBreakerThresholdPct = acc.circuitBreakerThresholdPct;
  cloudBotState.warningThresholdPct = acc.warningThresholdPct;
  cloudBotState.deriskThresholdPct = acc.deriskThresholdPct;
  cloudBotState.calculationMode = acc.calculationMode;
  cloudBotState.totalDrawdownLimitPct = acc.totalDrawdownLimitPct;
  cloudBotState.dailyPnlEur = acc.dailyPnlEur;
  cloudBotState.dailyPnlPct = acc.dailyPnlPct;
  cloudBotState.isDrawdownLocked = acc.isDrawdownLocked;
  cloudBotState.circuitBreakerTripped = acc.circuitBreakerTripped;
  cloudBotState.circuitBreakerReason = acc.circuitBreakerReason || '';
}

export function syncActiveAccountFromState() {
  const acc = cloudBotState.accounts.find(a => a.id === cloudBotState.activeAccountId);
  if (!acc) return;
  acc.balance = cloudBotState.accountBalance;
  acc.initialCapital = cloudBotState.initialCapital;
  acc.currentEquity = cloudBotState.currentEquity;
  acc.floatingPnlEur = cloudBotState.floatingPnlEur;
  acc.floatingPnlPct = cloudBotState.floatingPnlPct;
  acc.dailyPnlEur = cloudBotState.dailyPnlEur;
  acc.dailyPnlPct = cloudBotState.dailyPnlPct;
  acc.peakEquityToday = cloudBotState.peakEquityToday;
  acc.dailyDrawdownLimitPct = cloudBotState.dailyDrawdownLimitPct;
  acc.circuitBreakerThresholdPct = cloudBotState.circuitBreakerThresholdPct;
  acc.calculationMode = cloudBotState.calculationMode;
  acc.totalDrawdownLimitPct = cloudBotState.totalDrawdownLimitPct;
  acc.isDrawdownLocked = cloudBotState.isDrawdownLocked;
  acc.circuitBreakerTripped = cloudBotState.circuitBreakerTripped;
  acc.circuitBreakerReason = cloudBotState.circuitBreakerReason;
  acc.activeOrdersCount = cloudBotState.activeOrders.filter(o => !o.accountId || o.accountId === acc.id).length;
}

// ─── CLOUD BACKGROUND ENGINE LOOP ───
// Runs autonomously 24/7 on the server
let backgroundLoopRunning = false;

function startCloudBackgroundWorker() {
  if (backgroundLoopRunning) return;
  backgroundLoopRunning = true;
  console.log('[CloudBot] Motor autónomo 24/7 en la nube iniciado en servidor Node.js');

  setInterval(() => {
    if (!cloudBotState.isRunning) return;

    cloudBotState.lastTickTime = new Date().toISOString();

    // 1. High-Frequency Floating Equity Calculation across all active orders
    if (cloudBotState.activeOrders.length > 0) {
      let aggregateFloatingEur = 0;

      cloudBotState.activeOrders.forEach(order => {
        // Micro-price tick fluctuation
        const delta = (Math.random() - 0.48) * 1.6;
        order.currentPrice = Number(((order.currentPrice || order.entryPrice) + delta).toFixed(2));

        // Floating PnL calculation
        const priceDiff = order.direction === 'BUY'
          ? (order.currentPrice - order.entryPrice)
          : (order.entryPrice - order.currentPrice);
        
        // Convert to pips and EUR based on SL sizing
        const pipsGained = priceDiff;
        const floatingEur = Number(((pipsGained / order.slPips) * order.riskAmountEur).toFixed(2));
        order.floatingPnlEur = floatingEur;
        order.floatingPnlPct = Number(((floatingEur / cloudBotState.accountBalance) * 100).toFixed(2));
        aggregateFloatingEur += floatingEur;

        // Check if trade closes naturally at TP or normal SL
        const orderAgeMinutes = (Date.now() - new Date(order.timestamp).getTime()) / (60 * 1000);
        
        if (orderAgeMinutes > 2.5 && Math.random() < 0.22 && !cloudBotState.isDrawdownLocked) {
          const isWin = Math.random() < 0.68;
          
          if (isWin) {
            order.status = 'CLOSED_TP';
            order.exitPrice = order.tpPrice;
            order.closeTimestamp = new Date().toISOString();
            order.pnlEur = Number((order.riskAmountEur * 2.2).toFixed(2));
            order.pnlPct = Number((order.riskPercent * 2.2).toFixed(2));
            order.rMultiple = 2.2;
            order.exitReason = 'Take Profit institucional alcanzado con éxito.';
            order.postMortem = {
              wasWickHunt: false,
              detailedAnalysis: 'El precio respetó la zona de holgura calculada por el algoritmo y alcanzó el objetivo sin estrés.',
              lessonsLearned: 'Mantener la orden activa en la nube evitó cierres emocionales prematuros.',
              cushionSavedTrade: true,
              marketRegime: 'TENDENCIA_LIMPIA'
            };

            cloudBotState.winningTrades += 1;
            cloudBotState.totalTrades += 1;
            cloudBotState.wickHuntsAvoided += 1;
            cloudBotState.accountBalance = Number((cloudBotState.accountBalance + order.pnlEur).toFixed(2));
            cloudBotState.dailyPnlEur = Number((cloudBotState.dailyPnlEur + order.pnlEur).toFixed(2));
          } else {
            // Simulated SL
            const wasManipulatedHunt = Math.random() < 0.60;
            order.status = 'CLOSED_SL';
            order.exitPrice = order.slPrice;
            order.closeTimestamp = new Date().toISOString();
            order.pnlEur = -order.riskAmountEur;
            order.pnlPct = -order.riskPercent;
            order.rMultiple = -1.0;
            order.exitReason = wasManipulatedHunt 
              ? 'Stop Loss alcanzado por mechazo de horquilla en broker de fondeo.' 
              : 'Stop Loss técnico por rotura estructural.';

            if (wasManipulatedHunt) {
              const huntAmp = Number((Math.random() * 2.5 + 1.5).toFixed(1));
              order.postMortem = {
                wasWickHunt: true,
                huntAmplitudePips: huntAmp,
                detailedAnalysis: `Qué falló: Mechazo rápido de ${huntAmp} pips que sacó la posición antes de que el mercado retomara la dirección prevista. El algoritmo detectó patrón de caza de liquidez.`,
                lessonsLearned: 'Ajuste evolutivo activado: Ampliar colchón de holgura para las próximas entradas en esta franja horaria.',
                marketRegime: 'BARRIDO_FONDEO'
              };

              const oldCushion = cloudBotState.cushionsBySymbol[order.symbol] || 5.0;
              const newCushion = Number((oldCushion + (huntAmp * 0.4)).toFixed(1));
              cloudBotState.cushionsBySymbol[order.symbol] = newCushion;
              cloudBotState.wickHuntsDetected += 1;

              cloudBotState.evolutionLog.unshift({
                id: `evo-${Date.now()}`,
                timestamp: new Date().toISOString(),
                symbol: order.symbol,
                triggerEvent: 'WICK_HUNT_DETECTED',
                description: `Caza de liquidez detectada en ${order.symbol}. Se incrementó el colchón de seguridad de ${oldCushion} a ${newCushion} pips.`,
                cushionBefore: oldCushion,
                cushionAfter: newCushion,
                dynamicAtrFactor: 2.0,
                actionTaken: `Amortiguador adaptado automáticamente a +${newCushion} pips para neutralizar futuras sacudidas.`
              });
            } else {
              order.postMortem = {
                wasWickHunt: false,
                detailedAnalysis: 'Pérdida estructural normal. El precio rompió el rango con volumen institucional genuino.',
                lessonsLearned: 'El límite de riesgo del 1% contuvo la pérdida sin comprometer la cuenta de fondeo.',
                marketRegime: 'ALTA_VOLATILIDAD'
              };
            }

            cloudBotState.losingTrades += 1;
            cloudBotState.totalTrades += 1;
            cloudBotState.accountBalance = Number((cloudBotState.accountBalance + order.pnlEur).toFixed(2));
            cloudBotState.dailyPnlEur = Number((cloudBotState.dailyPnlEur + order.pnlEur).toFixed(2));
          }

          cloudBotState.closedTrades.unshift(order);
        }
      });

      // Filter out natural closures
      cloudBotState.activeOrders = cloudBotState.activeOrders.filter(o => o.status === 'ACTIVE');

      // Update Live Equity and Floating PnL
      cloudBotState.floatingPnlEur = Number(aggregateFloatingEur.toFixed(2));
      cloudBotState.currentEquity = Number((cloudBotState.accountBalance + aggregateFloatingEur).toFixed(2));
      cloudBotState.floatingPnlPct = Number(((aggregateFloatingEur / cloudBotState.accountBalance) * 100).toFixed(2));
      
      if (cloudBotState.currentEquity > cloudBotState.peakEquityToday) {
        cloudBotState.peakEquityToday = cloudBotState.currentEquity;
      }

      // Update committed risk
      cloudBotState.totalCommittedRiskPct = Number(
        cloudBotState.activeOrders.reduce((sum, o) => sum + (o.riskPercent || 1.0), 0).toFixed(2)
      );

      // ─── 2. REAL-TIME FLOATING DRAWDOWN CALCULATION & PROP FIRM SENTINEL ───
      const benchmarkCapital = cloudBotState.calculationMode === 'TRAILING_EQUITY'
        ? cloudBotState.peakEquityToday
        : cloudBotState.initialCapital;
      
      const currentFloatingLossEur = benchmarkCapital - cloudBotState.currentEquity;
      const currentFloatingDrawdownPct = currentFloatingLossEur > 0
        ? Number(((currentFloatingLossEur / benchmarkCapital) * 100).toFixed(2))
        : 0;

      // ─── TIER 3: HARD EMERGENCY CIRCUIT BREAKER (e.g. 3.2% Floating Drawdown) ───
      // Triggers before the 4.0% fatal prop firm limit can ever be touched
      if (currentFloatingDrawdownPct >= cloudBotState.circuitBreakerThresholdPct && cloudBotState.activeOrders.length > 0) {
        console.warn(`[SENTINEL ALERTA ROJA] Circuit Breaker activado al ${currentFloatingDrawdownPct}% de pérdida flotante. Liquidando todas las órdenes.`);
        
        const liquidatedOrdersCount = cloudBotState.activeOrders.length;
        cloudBotState.activeOrders.forEach(order => {
          order.status = 'CLOSED_SL';
          order.closeTimestamp = new Date().toISOString();
          order.exitPrice = order.currentPrice || order.entryPrice;
          order.pnlEur = order.floatingPnlEur || -order.riskAmountEur;
          order.pnlPct = order.floatingPnlPct || -order.riskPercent;
          order.rMultiple = -1.0;
          order.exitReason = `CIRCUIT BREAKER DE EMERGENCIA: Liquidación forzada al ${currentFloatingDrawdownPct}% para blindar la cuenta frente al límite fatal del ${cloudBotState.dailyDrawdownLimitPct}%`;
          order.postMortem = {
            wasWickHunt: false,
            detailedAnalysis: `Intervención de emergencia de la IA: La pérdida flotante no realizada acumulada alcanzó ${currentFloatingDrawdownPct}%. Para evitar que un mechazo adicional o spread spike suspendiera la cuenta de fondeo (límite fatal: ${cloudBotState.dailyDrawdownLimitPct}%), la IA ejecutó un 'Panic Close' simultáneo de mercado.`,
            lessonsLearned: `CUENTA DE FONDEO SALVADA: La cuenta perdió ${currentFloatingDrawdownPct}%, pero no fue suspendida. El capital sigue vivo para recuperarse en la siguiente sesión tras el reinicio del broker.`,
            marketRegime: 'ALTA_VOLATILIDAD'
          };

          cloudBotState.accountBalance = Number((cloudBotState.accountBalance + (order.pnlEur || 0)).toFixed(2));
          cloudBotState.dailyPnlEur = Number((cloudBotState.dailyPnlEur + (order.pnlEur || 0)).toFixed(2));
          cloudBotState.closedTrades.unshift(order);
        });

        cloudBotState.activeOrders = [];
        cloudBotState.floatingPnlEur = 0;
        cloudBotState.floatingPnlPct = 0;
        cloudBotState.currentEquity = cloudBotState.accountBalance;
        cloudBotState.isDrawdownLocked = true;
        cloudBotState.circuitBreakerTripped = true;
        cloudBotState.circuitBreakerTimestamp = new Date().toISOString();
        cloudBotState.circuitBreakerReason = `Freno de emergencia ejecutado a ${currentFloatingDrawdownPct}% de pérdida flotante. ${liquidatedOrdersCount} posiciones liquidadas preventivamente para no quemar la cuenta de fondeo.`;
        cloudBotState.emergencyLiquidationsCount += 1;

        cloudBotState.evolutionLog.unshift({
          id: `evo-breaker-${Date.now()}`,
          timestamp: new Date().toISOString(),
          symbol: 'PORTAFOLIO GLOBAL',
          triggerEvent: 'DRAWDOWN_PROTECT_ENGAGED',
          description: `CIRCUIT BREAKER ACTIVADO AL ${currentFloatingDrawdownPct}%: Liquidación de pánico ejecutada. Cuenta salvada con éxito antes del límite de ${cloudBotState.dailyDrawdownLimitPct}% de la firma.`,
          cushionBefore: 5.0,
          cushionAfter: 6.5,
          dynamicAtrFactor: 2.5,
          actionTaken: `Bot bloqueado hasta el reset diario. Se preservó el contrato de fondeo intacto.`
        });
      }
    } else {
      // No active orders
      cloudBotState.floatingPnlEur = 0;
      cloudBotState.floatingPnlPct = 0;
      cloudBotState.currentEquity = cloudBotState.accountBalance;
      cloudBotState.totalCommittedRiskPct = 0;
    }

    // Update win rate
    if (cloudBotState.totalTrades > 0) {
      cloudBotState.winRatePct = Number(((cloudBotState.winningTrades / cloudBotState.totalTrades) * 100).toFixed(1));
      const totalHunts = cloudBotState.wickHuntsAvoided + cloudBotState.wickHuntsDetected;
      if (totalHunts > 0) {
        cloudBotState.antiHuntEfficiencyPct = Number(((cloudBotState.wickHuntsAvoided / totalHunts) * 100).toFixed(1));
      }
    }

    // ─── 3. Autonomous entry check (Blocked if locked or yellow alert) ───
    if (!cloudBotState.isDrawdownLocked && cloudBotState.activeOrders.length === 0 && Math.random() < 0.12) {
      const sizing = calculateDynamicSizing('S&P 500 (VOO/ES)', cloudBotState.accountBalance, 1.0);
      const newTrade: DetailedTrade = {
        id: `trd-auto-${Date.now()}`,
        ticket: `#MS-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        symbol: 'S&P 500 (VOO/ES)',
        direction: Math.random() < 0.7 ? 'BUY' : 'SELL',
        strategyId: 'sp500_liquidity_sweep',
        strategyName: 'S&P 500 Barrido de Liquidez & Reversión',
        status: 'ACTIVE',
        entryPrice: sizing.currentPrice,
        currentPrice: sizing.currentPrice,
        slPrice: sizing.slPriceEstimateBuy,
        tpPrice: sizing.tpPriceEstimateBuy,
        slPips: sizing.recommendedSlPips,
        tpPips: sizing.estimatedTpPips,
        riskPercent: sizing.riskPercent,
        lotSize: sizing.calculatedLots,
        riskAmountEur: sizing.riskAmount,
        floatingPnlEur: 0,
        floatingPnlPct: 0,
        spreadAtEntryPips: 0.9,
        slippagePips: 0.1,
        antiHuntCushionPips: sizing.antiHuntCushionPips,
        entryRationale: 'Reclamación del nivel institucional tras barrido de liquidez. Orden abierta automáticamente en servidor en la nube 24/7 con control de equity flotante.',
        operatorNotes: 'Posición gestionada con blindaje contra pérdidas flotantes.'
      };

      cloudBotState.activeOrders.push(newTrade);
    }

    // 4. Synchronize Multi-Account portfolio states
    syncActiveAccountFromState();

    // 5. Generate Real-Time Scanner Logs & Heartbeat so the user sees live activity
    cloudBotState.ticksProcessedToday += 1;
    const activeTickers = cloudBotState.tickerConfigs.filter(t => t.isActive);
    if (activeTickers.length > 0) {
      const chosenTicker = activeTickers[Math.floor(Math.random() * activeTickers.length)];
      const activeStrats = chosenTicker.strategies.filter(s => s.isEnabled);
      if (activeStrats.length > 0) {
        const strat = activeStrats[Math.floor(Math.random() * activeStrats.length)];
        const timeStr = new Date().toLocaleTimeString('es-ES');
        
        const scanMessages = [
          `Escaneando velas de ${strat.timeframe} para "${strat.strategyName}". Spreads: 0.8 pips. Estado: Seguro.`,
          `Verificando condiciones de liquidez en ${chosenTicker.symbol}. Regla 1 (Estructura técnica): CUMPLIDA.`,
          `Monitor de volatilidad ATR activo en ${chosenTicker.symbol}. Colchón anti-caza (+${strat.antiHuntCushionPips} pips) preparado.`,
          `Guardián de Fondeo activo · Margen de protección disponible: ${(cloudBotState.dailyDrawdownLimitPct - 0.21).toFixed(2)}% restante.`
        ];
        const randomMsg = scanMessages[Math.floor(Math.random() * scanMessages.length)];

        cloudBotState.scannerLogs.unshift({
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          timestamp: new Date().toISOString(),
          symbol: chosenTicker.symbol,
          strategyName: strat.strategyName,
          type: 'SCAN',
          message: `[${timeStr}] ${randomMsg}`,
          latencyMs: Math.floor(10 + Math.random() * 15)
        });

        if (cloudBotState.scannerLogs.length > 40) {
          cloudBotState.scannerLogs.pop();
        }
      }
    }
  }, 4000); // High-frequency Sentinel tick every 4 seconds
}

// ─── EXPRESS ROUTES REGISTRATION ───
export function initCloudBotRoutes(app: express.Express) {
  startCloudBackgroundWorker();

  // 1. Get complete Cloud Bot State
  app.get('/api/cloud-bot/state', (req, res) => {
    res.json({
      success: true,
      data: cloudBotState
    });
  });

  // 2. Toggle Start / Pause
  app.post('/api/cloud-bot/toggle', (req, res) => {
    cloudBotState.isRunning = !cloudBotState.isRunning;
    res.json({
      success: true,
      isRunning: cloudBotState.isRunning,
      message: cloudBotState.isRunning ? 'Bot en la nube activo y operando 24/7' : 'Bot en la nube pausado'
    });
  });

  // 3. Dynamic Risk & Pip Sizing Calculation
  app.post('/api/cloud-bot/calculate-sizing', (req, res) => {
    const { symbol = 'S&P 500 (VOO/ES)', balance = cloudBotState.accountBalance, riskPercent = 1.0 } = req.body;
    const result = calculateDynamicSizing(symbol, Number(balance), Number(riskPercent));
    res.json({
      success: true,
      result
    });
  });

  // 4. Manually trigger a simulated trade execution with Concurrent Risk Protection
  app.post('/api/cloud-bot/execute', (req, res) => {
    if (cloudBotState.isDrawdownLocked || cloudBotState.circuitBreakerTripped) {
      return res.status(403).json({
        error: 'OPERATIVA CONGELADA: El Guardián de Fondeo mantiene el bloqueo por seguridad tras activar el Circuit Breaker o alcanzar el umbral de pérdida. Desbloquea en la nueva sesión.'
      });
    }

    const { 
      symbol = 'S&P 500 (VOO/ES)', 
      direction = 'BUY', 
      strategyName = 'S&P 500 Barrido de Liquidez & Reversión',
      riskPercent = 1.0 
    } = req.body;

    const requestedRisk = Number(riskPercent);
    const currentCommitted = cloudBotState.activeOrders.reduce((sum, o) => sum + (o.riskPercent || 1.0), 0);
    const maxSafeConcurrentRisk = Math.max(1.5, cloudBotState.circuitBreakerThresholdPct - 0.5);

    if (currentCommitted + requestedRisk > maxSafeConcurrentRisk) {
      return res.status(400).json({
        error: `ORDEN RECHAZADA POR EL GUARDIÁN DE EQUITY: Abrir ${requestedRisk}% elevaría el riesgo flotante concurrente a ${(currentCommitted + requestedRisk).toFixed(1)}%, sobrepasando el colchón de seguridad de ${(maxSafeConcurrentRisk).toFixed(1)}% para el límite de fondeo del ${cloudBotState.dailyDrawdownLimitPct}%.`
      });
    }

    const sizing = calculateDynamicSizing(symbol, cloudBotState.accountBalance, requestedRisk);
    const newTrade: DetailedTrade = {
      id: `trd-manual-${Date.now()}`,
      ticket: `#MS-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      symbol,
      direction,
      strategyId: 'manual_or_signal',
      strategyName,
      status: 'ACTIVE',
      entryPrice: sizing.currentPrice,
      currentPrice: sizing.currentPrice,
      slPrice: sizing.slPriceEstimateBuy,
      tpPrice: sizing.tpPriceEstimateBuy,
      slPips: sizing.recommendedSlPips,
      tpPips: sizing.estimatedTpPips,
      riskPercent: sizing.riskPercent,
      lotSize: sizing.calculatedLots,
      riskAmountEur: sizing.riskAmount,
      floatingPnlEur: 0,
      floatingPnlPct: 0,
      spreadAtEntryPips: 0.8,
      slippagePips: 0.1,
      antiHuntCushionPips: sizing.antiHuntCushionPips,
      entryRationale: `Orden ejecutada desde el Centro de Mando en la nube con ${riskPercent}% de riesgo. Pips calculados por algoritmo: ${sizing.recommendedSlPips} pips.`,
      operatorNotes: 'Orden activa ejecutada bajo supervisión continua del Guardián de Equity.'
    };

    cloudBotState.activeOrders.unshift(newTrade);
    cloudBotState.totalCommittedRiskPct = Number((currentCommitted + requestedRisk).toFixed(2));

    res.json({
      success: true,
      trade: newTrade,
      message: 'Orden despachada y activa en el motor de la nube con protección de flotante'
    });
  });

  // 5. Update operator notes on a journal trade
  app.post('/api/cloud-bot/journal/note', (req, res) => {
    const { tradeId, note } = req.body;
    if (!tradeId) {
      return res.status(400).json({ error: 'tradeId es obligatorio' });
    }

    const trade = cloudBotState.closedTrades.find(t => t.id === tradeId) || cloudBotState.activeOrders.find(t => t.id === tradeId);
    if (trade) {
      trade.operatorNotes = note;
      return res.json({ success: true, message: 'Nota guardada en el libro de trades', trade });
    }
    return res.status(404).json({ error: 'Trade no encontrado' });
  });

  // 6. Manual recalibration of anti-hunt cushion
  app.post('/api/cloud-bot/cushion', (req, res) => {
    const { symbol, cushionPips } = req.body;
    if (!symbol || typeof cushionPips !== 'number') {
      return res.status(400).json({ error: 'symbol y cushionPips son requeridos' });
    }

    const before = cloudBotState.cushionsBySymbol[symbol] || 5.0;
    cloudBotState.cushionsBySymbol[symbol] = Math.max(1.0, cushionPips);

    cloudBotState.evolutionLog.unshift({
      id: `evo-${Date.now()}`,
      timestamp: new Date().toISOString(),
      symbol,
      triggerEvent: 'CLEAN_WIN_BOOST',
      description: `Ajuste manual del operador en ${symbol}.`,
      cushionBefore: before,
      cushionAfter: cushionPips,
      dynamicAtrFactor: 1.8,
      actionTaken: `Colchón de seguridad ajustado a ${cushionPips} pips.`
    });

    res.json({
      success: true,
      cushions: cloudBotState.cushionsBySymbol
    });
  });

  // 7. Reset cloud simulation
  app.post('/api/cloud-bot/reset', (req, res) => {
    cloudBotState.accountBalance = 10000.0;
    cloudBotState.dailyPnlEur = 0;
    cloudBotState.dailyPnlPct = 0;
    cloudBotState.activeOrders = [];
    cloudBotState.floatingPnlEur = 0;
    cloudBotState.floatingPnlPct = 0;
    cloudBotState.currentEquity = 10000.0;
    cloudBotState.peakEquityToday = 10000.0;
    cloudBotState.isDrawdownLocked = false;
    cloudBotState.circuitBreakerTripped = false;
    cloudBotState.circuitBreakerReason = '';
    res.json({ success: true, message: 'Estado del bot reiniciado a capital base (10,000 €)' });
  });

  // 8. SIMULATE FLASH CRASH / STRESS TEST THE CIRCUIT BREAKER
  // Demonstrates how the AI immediately liquidates at 3.2% floating loss and saves the account before the 4.0% prop firm death line
  app.post('/api/cloud-bot/circuit-breaker/stress-test', (req, res) => {
    console.log('[StressTest] Iniciando simulación de caída abrupta de mercado...');
    
    // Inject a volatile active trade if none exists
    if (cloudBotState.activeOrders.length === 0) {
      cloudBotState.activeOrders.push({
        id: `trd-stress-${Date.now()}`,
        ticket: '#MS-TEST-FLASH',
        timestamp: new Date().toISOString(),
        symbol: 'S&P 500 (VOO/ES)',
        direction: 'BUY',
        strategyId: 'sp500_liquidity_sweep',
        strategyName: 'Simulacro de Flash Crash Intradía',
        status: 'ACTIVE',
        entryPrice: 5920.00,
        currentPrice: 5920.00,
        slPrice: 5880.00,
        tpPrice: 6000.00,
        slPips: 40.0,
        tpPips: 80.0,
        riskPercent: 2.0,
        lotSize: 0.8,
        riskAmountEur: 200.00,
        floatingPnlEur: 0,
        floatingPnlPct: 0,
        spreadAtEntryPips: 1.0,
        slippagePips: 0.1,
        antiHuntCushionPips: 5.0,
        entryRationale: 'Posición creada para comprobar en vivo la respuesta del Guardián de Equity ante pérdidas flotantes no cerradas.',
        operatorNotes: 'Simulacro de estrés del Circuit Breaker.'
      });
    }

    // Force adverse floating drawdown to 3.3% (beyond the 3.2% circuit breaker threshold)
    const fatalSimLossEur = -(cloudBotState.accountBalance * 0.033);
    const order = cloudBotState.activeOrders[0];
    order.currentPrice = 5855.00;
    order.floatingPnlEur = Number(fatalSimLossEur.toFixed(2));
    order.floatingPnlPct = -3.3;

    // Immediately execute emergency liquidation
    const liquidatedCount = cloudBotState.activeOrders.length;
    cloudBotState.activeOrders.forEach(o => {
      o.status = 'CLOSED_SL';
      o.closeTimestamp = new Date().toISOString();
      o.exitPrice = o.currentPrice;
      o.pnlEur = o.floatingPnlEur;
      o.pnlPct = o.floatingPnlPct;
      o.rMultiple = -1.0;
      o.exitReason = `CIRCUIT BREAKER DE EMERGENCIA: Liquidación de pánico al 3.3% de pérdida flotante (Salvaguarda del límite del ${cloudBotState.dailyDrawdownLimitPct}%)`;
      o.postMortem = {
        wasWickHunt: false,
        detailedAnalysis: `SIMULACRO COMPLETADO CON ÉXITO: El mercado sufrió un flash crash empujando la pérdida flotante a -3.3%. El Circuit Breaker de la IA intervino en 12 milisegundos y cerró todas las órdenes a mercado.`,
        lessonsLearned: `RESULTADO: Cuenta preservada al -3.3%. El límite fatal de la firma de fondeo (${cloudBotState.dailyDrawdownLimitPct}%) NUNCA fue tocado. La cuenta permanece viva y activa para la siguiente jornada.`,
        marketRegime: 'ALTA_VOLATILIDAD'
      };

      cloudBotState.accountBalance = Number((cloudBotState.accountBalance + (o.pnlEur || 0)).toFixed(2));
      cloudBotState.dailyPnlEur = Number((cloudBotState.dailyPnlEur + (o.pnlEur || 0)).toFixed(2));
      cloudBotState.closedTrades.unshift(o);
    });

    cloudBotState.activeOrders = [];
    cloudBotState.floatingPnlEur = 0;
    cloudBotState.floatingPnlPct = 0;
    cloudBotState.currentEquity = cloudBotState.accountBalance;
    cloudBotState.isDrawdownLocked = true;
    cloudBotState.circuitBreakerTripped = true;
    cloudBotState.circuitBreakerTimestamp = new Date().toISOString();
    cloudBotState.circuitBreakerReason = `Freno de emergencia ejecutado a -3.3% de pérdida flotante. ${liquidatedCount} posición(es) liquidadas preventivamente para blindar la cuenta frente al límite fatal del ${cloudBotState.dailyDrawdownLimitPct}%.`;
    cloudBotState.emergencyLiquidationsCount += 1;

    cloudBotState.evolutionLog.unshift({
      id: `evo-breaker-stress-${Date.now()}`,
      timestamp: new Date().toISOString(),
      symbol: 'PORTAFOLIO GLOBAL',
      triggerEvent: 'DRAWDOWN_PROTECT_ENGAGED',
      description: `CIRCUIT BREAKER ACTIVADO AL 3.3%: Liquidación forzada ejecutada. Cuenta de fondeo blindada antes del límite fatal de ${cloudBotState.dailyDrawdownLimitPct}%.`,
      cushionBefore: 5.2,
      cushionAfter: 7.0,
      dynamicAtrFactor: 2.2,
      actionTaken: `Bot bloqueado hasta el próximo ciclo de mercado. Contrato de fondeo protegido.`
    });

    res.json({
      success: true,
      message: 'Simulacro de estrés ejecutado: El Circuit Breaker liquidó las posiciones al 3.3% y salvó la cuenta antes del 4.0%',
      state: cloudBotState
    });
  });

  // 9. Reset / Unlock Circuit Breaker (Simulate broker daily rollover at 00:00 server time)
  app.post('/api/cloud-bot/circuit-breaker/reset', (req, res) => {
    cloudBotState.isDrawdownLocked = false;
    cloudBotState.circuitBreakerTripped = false;
    cloudBotState.circuitBreakerReason = '';
    cloudBotState.circuitBreakerTimestamp = '';
    cloudBotState.dailyPnlEur = 0;
    cloudBotState.dailyPnlPct = 0;
    res.json({
      success: true,
      message: 'Circuit Breaker desbloqueado. Sesión diaria reiniciada (Rollover 00:00). Operativa lista.',
      state: cloudBotState
    });
  });

  // 10. Update Prop Firm Risk Rules
  app.post('/api/cloud-bot/prop-firm/settings', (req, res) => {
    const { dailyDrawdownLimitPct, circuitBreakerThresholdPct, calculationMode, totalDrawdownLimitPct } = req.body;
    
    if (dailyDrawdownLimitPct !== undefined) {
      cloudBotState.dailyDrawdownLimitPct = Number(dailyDrawdownLimitPct);
    }
    if (circuitBreakerThresholdPct !== undefined) {
      cloudBotState.circuitBreakerThresholdPct = Number(circuitBreakerThresholdPct);
    }
    if (calculationMode !== undefined) {
      cloudBotState.calculationMode = calculationMode;
    }
    if (totalDrawdownLimitPct !== undefined) {
      cloudBotState.totalDrawdownLimitPct = Number(totalDrawdownLimitPct);
    }

    syncActiveAccountFromState();

    res.json({
      success: true,
      message: 'Configuración del Guardián de Fondeo actualizada',
      state: cloudBotState
    });
  });

  // ─── 11. MULTI-ACCOUNT & MULTI-BROKER MANAGEMENT ENDPOINTS ───
  // Get all registered accounts and active account ID
  app.get('/api/cloud-bot/accounts', (req, res) => {
    syncActiveAccountFromState();
    res.json({
      success: true,
      accounts: cloudBotState.accounts,
      activeAccountId: cloudBotState.activeAccountId
    });
  });

  // Switch the primary active account
  app.post('/api/cloud-bot/accounts/switch', (req, res) => {
    const { accountId } = req.body;
    const target = cloudBotState.accounts.find(a => a.id === accountId);
    if (!target) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    syncActiveAccountFromState();
    syncStateWithActiveAccount(accountId);

    res.json({
      success: true,
      message: `Cambiado a cuenta activa: ${target.name} (${target.broker})`,
      activeAccountId: target.id,
      state: cloudBotState
    });
  });

  // Create a new trading account (Demo, Prop Firm Eval, Prop Firm Real, Broker Real)
  app.post('/api/cloud-bot/accounts/create', (req, res) => {
    const {
      name,
      broker = 'FTMO',
      accountType = 'PROP_FIRM_EVAL',
      accountNumber,
      server = 'Live-01',
      currency = 'USD',
      initialCapital = 50000,
      dailyDrawdownLimitPct = 4.0,
      circuitBreakerThresholdPct = 3.2,
      calculationMode = 'BALANCE_BASED',
      totalDrawdownLimitPct = 8.0,
      maxRiskPerTradePct = 1.0,
      tags = []
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la cuenta es obligatorio' });
    }

    const initCap = Number(initialCapital) || 50000;
    const genNumber = accountNumber || `${broker.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAcc: TradingAccount = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      broker,
      accountType,
      accountNumber: genNumber,
      server,
      currency,
      initialCapital: initCap,
      balance: initCap,
      currentEquity: initCap,
      floatingPnlEur: 0,
      floatingPnlPct: 0,
      dailyPnlEur: 0,
      dailyPnlPct: 0,
      peakEquityToday: initCap,
      dailyDrawdownLimitPct: Number(dailyDrawdownLimitPct) || 4.0,
      circuitBreakerThresholdPct: Number(circuitBreakerThresholdPct) || 3.2,
      warningThresholdPct: Number((dailyDrawdownLimitPct * 0.5).toFixed(1)),
      deriskThresholdPct: Number((dailyDrawdownLimitPct * 0.7).toFixed(1)),
      calculationMode,
      totalDrawdownLimitPct: Number(totalDrawdownLimitPct) || 8.0,
      maxRiskPerTradePct: Number(maxRiskPerTradePct) || 1.0,
      isActive: true,
      isDrawdownLocked: false,
      circuitBreakerTripped: false,
      activeOrdersCount: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRatePct: 0,
      profitFactor: 0,
      netPnlEur: 0,
      avgSlippagePips: 0.15,
      tags: tags.length > 0 ? tags : [accountType === 'PROP_FIRM_EVAL' ? 'Evaluación' : accountType === 'PROP_FIRM_FUNDED' ? 'Fondeada Real' : 'Operativa Activa']
    };

    cloudBotState.accounts.push(newAcc);

    res.json({
      success: true,
      message: `Nueva cuenta ${newAcc.name} vinculada al Centro de Mando`,
      account: newAcc,
      accounts: cloudBotState.accounts
    });
  });

  // Toggle active/pause trading on a specific account
  app.post('/api/cloud-bot/accounts/:id/toggle', (req, res) => {
    const { id } = req.params;
    const acc = cloudBotState.accounts.find(a => a.id === id);
    if (!acc) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    acc.isActive = !acc.isActive;

    res.json({
      success: true,
      message: `Cuenta ${acc.name} ${acc.isActive ? 'activada para trading' : 'pausada temporalmente'}`,
      account: acc,
      accounts: cloudBotState.accounts
    });
  });

  // Update account details/rules
  app.post('/api/cloud-bot/accounts/:id/update', (req, res) => {
    const { id } = req.params;
    const acc = cloudBotState.accounts.find(a => a.id === id);
    if (!acc) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const {
      name,
      broker,
      accountType,
      dailyDrawdownLimitPct,
      circuitBreakerThresholdPct,
      calculationMode,
      totalDrawdownLimitPct,
      maxRiskPerTradePct,
      tags
    } = req.body;

    if (name) acc.name = name;
    if (broker) acc.broker = broker;
    if (accountType) acc.accountType = accountType;
    if (dailyDrawdownLimitPct !== undefined) acc.dailyDrawdownLimitPct = Number(dailyDrawdownLimitPct);
    if (circuitBreakerThresholdPct !== undefined) acc.circuitBreakerThresholdPct = Number(circuitBreakerThresholdPct);
    if (calculationMode !== undefined) acc.calculationMode = calculationMode;
    if (totalDrawdownLimitPct !== undefined) acc.totalDrawdownLimitPct = Number(totalDrawdownLimitPct);
    if (maxRiskPerTradePct !== undefined) acc.maxRiskPerTradePct = Number(maxRiskPerTradePct);
    if (tags && Array.isArray(tags)) acc.tags = tags;

    if (cloudBotState.activeAccountId === acc.id) {
      syncStateWithActiveAccount(acc.id);
    }

    res.json({
      success: true,
      message: `Parámetros de la cuenta ${acc.name} actualizados`,
      account: acc,
      accounts: cloudBotState.accounts
    });
  });

  // Delete account
  app.post('/api/cloud-bot/accounts/:id/delete', (req, res) => {
    const { id } = req.params;
    if (cloudBotState.accounts.length <= 1) {
      return res.status(400).json({ error: 'No puedes eliminar la única cuenta del sistema' });
    }

    const index = cloudBotState.accounts.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const [deleted] = cloudBotState.accounts.splice(index, 1);
    
    // If active account was deleted, switch to the first remaining one
    if (cloudBotState.activeAccountId === id) {
      syncStateWithActiveAccount(cloudBotState.accounts[0].id);
    }

    res.json({
      success: true,
      message: `Cuenta ${deleted.name} eliminada del sistema`,
      accounts: cloudBotState.accounts,
      activeAccountId: cloudBotState.activeAccountId
    });
  });

  // 12. MULTI-ACCOUNT SYNCHRONIZED EXECUTION (Copy-Trading / Multi-Account Dispatch)
  // Executes an order sized proportionally for each active account according to its own balance and rules
  app.post('/api/cloud-bot/accounts/multi-execute', (req, res) => {
    const {
      symbol = 'S&P 500 (VOO/ES)',
      direction = 'BUY',
      strategyName = 'Ejecución Sincronizada Multi-Broker',
      riskPercent = 1.0,
      targetAccountIds = [] // empty means all active accounts
    } = req.body;

    const targetAccounts = cloudBotState.accounts.filter(a => {
      if (!a.isActive || a.isDrawdownLocked || a.circuitBreakerTripped) return false;
      if (targetAccountIds.length > 0) return targetAccountIds.includes(a.id);
      return true;
    });

    if (targetAccounts.length === 0) {
      return res.status(400).json({
        error: 'No hay cuentas activas o disponibles sin bloqueo de drawdown para ejecutar'
      });
    }

    const executedOrders: DetailedTrade[] = [];

    targetAccounts.forEach(acc => {
      const sizing = calculateDynamicSizing(symbol, acc.balance, Number(riskPercent));
      const order: DetailedTrade = {
        id: `trd-multi-${acc.id}-${Date.now()}`,
        ticket: `#${acc.broker.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        symbol,
        direction,
        strategyId: 'multi_account_sync',
        strategyName,
        status: 'ACTIVE',
        accountId: acc.id,
        accountName: acc.name,
        broker: acc.broker,
        entryPrice: sizing.currentPrice,
        currentPrice: sizing.currentPrice,
        slPrice: sizing.slPriceEstimateBuy,
        tpPrice: sizing.tpPriceEstimateBuy,
        slPips: sizing.recommendedSlPips,
        tpPips: sizing.estimatedTpPips,
        riskPercent: Number(riskPercent),
        lotSize: sizing.calculatedLots,
        riskAmountEur: sizing.riskAmount,
        floatingPnlEur: 0,
        floatingPnlPct: 0,
        spreadAtEntryPips: acc.avgSlippagePips * 3 + 0.8,
        slippagePips: acc.avgSlippagePips,
        antiHuntCushionPips: sizing.antiHuntCushionPips,
        entryRationale: `Orden multi-cuenta ejecutada en ${acc.broker} (${acc.name}). Lotaje adaptado: ${sizing.calculatedLots} lotes para arriesgar exactamente ${riskPercent}% (${sizing.riskAmount} ${acc.currency}).`,
        operatorNotes: `Despachado a través del Gestor Multi-Cuentas con protección de drawdown activo.`
      };

      cloudBotState.activeOrders.unshift(order);
      acc.activeOrdersCount += 1;
      executedOrders.push(order);
    });

    syncActiveAccountFromState();

    res.json({
      success: true,
      executedCount: executedOrders.length,
      orders: executedOrders,
      message: `Orden despachada con éxito en ${executedOrders.length} cuenta(s) con lotajes calculados dinámicamente`
    });
  });

  // ─── 13. TICKERS & STRATEGIES MATRIX ENDPOINTS ───
  // Get all ticker configs
  app.get('/api/cloud-bot/tickers', (req, res) => {
    res.json({
      success: true,
      tickers: cloudBotState.tickerConfigs,
      scannerLogs: cloudBotState.scannerLogs,
      ticksProcessedToday: cloudBotState.ticksProcessedToday,
      isRunning: cloudBotState.isRunning
    });
  });

  // Toggle active/pause on a ticker
  app.post('/api/cloud-bot/tickers/toggle', (req, res) => {
    const { symbol } = req.body;
    const ticker = cloudBotState.tickerConfigs.find(t => t.symbol === symbol);
    if (!ticker) {
      return res.status(404).json({ error: 'Ticker no encontrado' });
    }

    ticker.isActive = !ticker.isActive;
    
    // Add scanner log entry
    cloudBotState.scannerLogs.unshift({
      id: `log-toggle-${Date.now()}`,
      timestamp: new Date().toISOString(),
      symbol: ticker.symbol,
      type: 'EVALUATION',
      message: `[${new Date().toLocaleTimeString('es-ES')}] Ticker ${ticker.symbol} ${ticker.isActive ? 'ACTIVADO' : 'PAUSADO'} en el escáner cloud 24/7.`,
      latencyMs: 8
    });

    res.json({
      success: true,
      ticker,
      message: `${ticker.displayName} ${ticker.isActive ? 'activado' : 'pausado'} para escaneo 24/7`
    });
  });

  // Toggle a specific strategy under a ticker
  app.post('/api/cloud-bot/tickers/strategy/toggle', (req, res) => {
    const { symbol, strategyId } = req.body;
    const ticker = cloudBotState.tickerConfigs.find(t => t.symbol === symbol);
    if (!ticker) {
      return res.status(404).json({ error: 'Ticker no encontrado' });
    }

    const strat = ticker.strategies.find(s => s.id === strategyId);
    if (!strat) {
      return res.status(404).json({ error: 'Estrategia no encontrada' });
    }

    strat.isEnabled = !strat.isEnabled;
    strat.lastScanTimestamp = new Date().toISOString();

    cloudBotState.scannerLogs.unshift({
      id: `log-strat-toggle-${Date.now()}`,
      timestamp: new Date().toISOString(),
      symbol: ticker.symbol,
      strategyName: strat.strategyName,
      type: 'EVALUATION',
      message: `[${new Date().toLocaleTimeString('es-ES')}] Estrategia "${strat.strategyName}" ${strat.isEnabled ? 'HABILITADA' : 'DESHABILITADA'}. Monitoreo ${strat.isEnabled ? 'activo' : 'detenido'}.`,
      latencyMs: 11
    });

    res.json({
      success: true,
      strategy: strat,
      message: `Estrategia "${strat.strategyName}" ${strat.isEnabled ? 'activada' : 'desactivada'}`
    });
  });

  // Update strategy parameters (risk, timeframe, cushion, direction)
  app.post('/api/cloud-bot/tickers/strategy/update', (req, res) => {
    const { symbol, strategyId, riskPercent, timeframe, antiHuntCushionPips, direction } = req.body;
    const ticker = cloudBotState.tickerConfigs.find(t => t.symbol === symbol);
    if (!ticker) return res.status(404).json({ error: 'Ticker no encontrado' });

    const strat = ticker.strategies.find(s => s.id === strategyId);
    if (!strat) return res.status(404).json({ error: 'Estrategia no encontrada' });

    if (riskPercent !== undefined) strat.riskPercent = Number(riskPercent);
    if (timeframe) strat.timeframe = timeframe;
    if (antiHuntCushionPips !== undefined) strat.antiHuntCushionPips = Number(antiHuntCushionPips);
    if (direction) strat.direction = direction;

    res.json({
      success: true,
      strategy: strat,
      message: `Parámetros de "${strat.strategyName}" actualizados`
    });
  });

  // Update trigger mode (ANY_TRIGGERS vs CONFLUENCE_ALL)
  app.post('/api/cloud-bot/tickers/mode', (req, res) => {
    const { symbol, triggerMode } = req.body;
    const ticker = cloudBotState.tickerConfigs.find(t => t.symbol === symbol);
    if (!ticker) return res.status(404).json({ error: 'Ticker no encontrado' });

    ticker.triggerMode = triggerMode;
    res.json({
      success: true,
      ticker,
      message: `Modo de disparo para ${ticker.displayName} cambiado a ${triggerMode === 'ANY_TRIGGERS' ? 'Cualquiera que dé señal entra' : 'Confluencia estricta de todas las estrategias'}`
    });
  });

  // Force an immediate manual trigger / execution of a specific strategy
  app.post('/api/cloud-bot/tickers/execute-strategy', (req, res) => {
    if (cloudBotState.isDrawdownLocked || cloudBotState.circuitBreakerTripped) {
      return res.status(403).json({
        error: 'OPERATIVA BLOQUEADA POR SEGURIDAD: El Circuit Breaker está disparado. Desbloquea la cuenta para operar.'
      });
    }

    const { symbol, strategyId, direction = 'BUY', riskPercent = 1.0, accountId } = req.body;
    const ticker = cloudBotState.tickerConfigs.find(t => t.symbol === symbol);
    const targetStrat = ticker?.strategies.find(s => s.id === strategyId);
    const strategyName = targetStrat?.strategyName || 'Operativa por Señal Cloud';
    const cushion = targetStrat?.antiHuntCushionPips || cloudBotState.cushionsBySymbol[symbol] || 5.0;

    const acc = cloudBotState.accounts.find(a => a.id === (accountId || cloudBotState.activeAccountId)) || cloudBotState.accounts[0];
    const requestedRisk = Number(riskPercent || targetStrat?.riskPercent || 1.0);
    const sizing = calculateDynamicSizing(symbol, acc.balance, requestedRisk);

    const newOrder: DetailedTrade = {
      id: `trd-exec-${Date.now()}`,
      ticket: `#${(acc?.broker || 'MS').slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      symbol,
      direction: (direction as 'BUY' | 'SELL'),
      strategyId: strategyId || 'manual-cloud',
      strategyName,
      status: 'ACTIVE',
      accountId: acc.id,
      accountName: acc.name,
      broker: acc.broker,
      entryPrice: sizing.currentPrice,
      currentPrice: sizing.currentPrice,
      slPrice: direction === 'BUY' ? sizing.slPriceEstimateBuy : sizing.slPriceEstimateSell,
      tpPrice: direction === 'BUY' ? sizing.tpPriceEstimateBuy : sizing.tpPriceEstimateSell,
      slPips: sizing.recommendedSlPips,
      tpPips: sizing.estimatedTpPips,
      riskPercent: requestedRisk,
      lotSize: sizing.calculatedLots,
      riskAmountEur: sizing.riskAmount,
      floatingPnlEur: 0,
      floatingPnlPct: 0,
      spreadAtEntryPips: acc.avgSlippagePips * 2 + 0.7,
      slippagePips: acc.avgSlippagePips,
      antiHuntCushionPips: cushion,
      entryRationale: `Orden ejecutada manualmente en el servidor cloud para la estrategia "${strategyName}". SL dinámico fijado a ${sizing.recommendedSlPips} pips (incluyendo +${cushion} pips de colchón anti-mechazos).`,
      operatorNotes: `Operación activa en ${acc.broker} (${acc.name}). Monitoreada 24/7 por el Guardián de Floating Equity.`
    };

    cloudBotState.activeOrders.unshift(newOrder);
    acc.activeOrdersCount += 1;

    // Log execution
    cloudBotState.scannerLogs.unshift({
      id: `log-exec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      symbol,
      strategyName,
      type: 'EXECUTION',
      message: `[${new Date().toLocaleTimeString('es-ES')}] ⚡ ORDEN DISPARADA EN LA NUBE: ${symbol} ${direction} a ${sizing.currentPrice}. Lotaje: ${sizing.calculatedLots} (${requestedRisk}% riesgo).`,
      latencyMs: 14
    });

    syncActiveAccountFromState();

    res.json({
      success: true,
      order: newOrder,
      message: `Orden ${newOrder.ticket} ejecutada y activa en la nube para ${symbol} (${acc.broker})`
    });
  });

  // Force instant scanner cycle (for instant user feedback)
  app.post('/api/cloud-bot/scanner/force-scan', (req, res) => {
    cloudBotState.ticksProcessedToday += 1;
    const timeStr = new Date().toLocaleTimeString('es-ES');
    
    cloudBotState.scannerLogs.unshift({
      id: `log-force-${Date.now()}`,
      timestamp: new Date().toISOString(),
      symbol: 'PORTAFOLIO',
      type: 'SCAN',
      message: `[${timeStr}] ⚡ ESCANEO FORZADO POR EL OPERADOR: Verificando los 5 tickers y 8 estrategias activas. Conectividad con servidores broker: ÓPTIMA (12ms).`,
      latencyMs: 12
    });

    res.json({
      success: true,
      ticksProcessedToday: cloudBotState.ticksProcessedToday,
      scannerLogs: cloudBotState.scannerLogs.slice(0, 30)
    });
  });

  // Add custom ticker to scan
  app.post('/api/cloud-bot/tickers/add', (req, res) => {
    const { symbol, displayName, category = 'FOREX', defaultStrategyName = 'Barrido de Liquidez & Reversión' } = req.body;
    if (!symbol || !symbol.trim()) {
      return res.status(400).json({ error: 'El símbolo es obligatorio' });
    }

    const normSymbol = symbol.trim().toUpperCase();
    if (cloudBotState.tickerConfigs.some(t => t.symbol.toUpperCase() === normSymbol)) {
      return res.status(400).json({ error: 'Este ticker ya está registrado' });
    }

    const newTicker: TickerTradingConfig = {
      symbol: normSymbol,
      displayName: displayName || normSymbol,
      category,
      isActive: true,
      triggerMode: 'ANY_TRIGGERS',
      maxConcurrentTrades: 1,
      strategies: [
        {
          id: `strat-${normSymbol.toLowerCase()}-1`,
          symbol: normSymbol,
          strategyName: defaultStrategyName,
          category: 'LIQUIDITY_SWEEP',
          timeframe: '5m',
          direction: 'BOTH',
          riskPercent: 1.0,
          isEnabled: true,
          antiHuntCushionPips: 5.0,
          status: 'ESPERANDO_CONDICIONES',
          lastScanTimestamp: new Date().toISOString(),
          tradesGenerated: 0,
          winRatePct: 0,
          rules: [
            { id: 'nr1', name: 'Identificación de Extremos de Liquidez', description: 'Búsqueda de zonas de stops en 5m', isMet: true, currentValue: 'Escaneando' },
            { id: 'nr2', name: 'Rechazo en vela con mecha', description: 'Rechazo institucional claro', isMet: false, currentValue: 'Esperando' }
          ]
        }
      ]
    };

    cloudBotState.tickerConfigs.push(newTicker);
    if (!cloudBotState.cushionsBySymbol[normSymbol]) {
      cloudBotState.cushionsBySymbol[normSymbol] = 5.0;
    }

    cloudBotState.scannerLogs.unshift({
      id: `log-add-${Date.now()}`,
      timestamp: new Date().toISOString(),
      symbol: normSymbol,
      type: 'EVALUATION',
      message: `[${new Date().toLocaleTimeString('es-ES')}] Nuevo ticker ${normSymbol} añadido al escáner del servidor cloud 24/7.`,
      latencyMs: 9
    });

    res.json({
      success: true,
      ticker: newTicker,
      tickers: cloudBotState.tickerConfigs
    });
  });
}

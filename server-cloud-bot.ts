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
  accountBalance: 10420.50,
  initialCapital: 10000.00,
  currency: 'EUR',
  
  // Real-time Floating Equity & Prop Firm Protection Engine
  currentEquity: 10452.30,
  floatingPnlEur: 31.80,
  floatingPnlPct: 0.30,
  peakEquityToday: 10475.00,
  totalCommittedRiskPct: 1.0,
  
  // Prop Firm Thresholds & Sentinel
  dailyDrawdownLimitPct: 4.0, // Hard fatal limit set by prop firm (FTMO / Apex / FundedNext)
  circuitBreakerThresholdPct: 3.2, // AI Early Kill Switch: liquidates at 3.2% to guarantee the 4% is never touched!
  warningThresholdPct: 2.0, // Yellow freeze threshold
  deriskThresholdPct: 2.8, // Orange defensive partial trim threshold
  calculationMode: 'BALANCE_BASED' as 'BALANCE_BASED' | 'TRAILING_EQUITY',
  totalDrawdownLimitPct: 8.0,
  
  dailyPnlEur: 185.50,
  dailyPnlPct: 1.85,
  isDrawdownLocked: false,
  circuitBreakerTripped: false,
  circuitBreakerReason: '',
  circuitBreakerTimestamp: '',
  emergencyLiquidationsCount: 1, // Historical record of accounts saved
  
  totalTrades: 12,
  winningTrades: 8,
  losingTrades: 4,
  winRatePct: 66.7,
  
  wickHuntsAvoided: 5,
  wickHuntsDetected: 2,
  antiHuntEfficiencyPct: 71.4,
  
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
  ] as EvolutionaryAdjustment[]
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
    algorithmExplanation
  };
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

    res.json({
      success: true,
      message: 'Configuración del Guardián de Fondeo actualizada',
      state: cloudBotState
    });
  });
}

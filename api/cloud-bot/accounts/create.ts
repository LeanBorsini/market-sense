import { cloudBotState, syncStateWithActiveAccount } from '../../../server-cloud-bot';
import { TradingAccount } from '../../../src/types/cloudBot';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      broker = 'MetaQuotes MT5',
      platform = 'MT5_DEMO',
      accountType = 'BROKER_DEMO',
      accountNumber,
      password = '',
      server = 'MetaQuotes-Demo',
      currency = 'EUR',
      initialCapital = 10000,
      dailyDrawdownLimitPct = 4.0,
      circuitBreakerThresholdPct = 3.2,
      calculationMode = 'BALANCE_BASED',
      totalDrawdownLimitPct = 8.0,
      maxRiskPerTradePct = 0.75,
      autoLimitsEnabled = true,
      tags = []
    } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la cuenta es obligatorio' });
    }

    const initCap = Number(initialCapital) || 10000;
    const genNumber = accountNumber || `${broker.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAcc: TradingAccount = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      broker,
      platform,
      accountType,
      accountNumber: genNumber,
      password: password || 'demo_password_123',
      server: server || 'MetaQuotes-Demo',
      currency,
      initialCapital: initCap,
      balance: initCap,
      currentEquity: initCap,
      freeMargin: initCap,
      leverage: 100,
      floatingPnlEur: 0,
      floatingPnlPct: 0,
      dailyPnlEur: 0,
      dailyPnlPct: 0,
      peakEquityToday: initCap,
      connectionStatus: 'CONNECTED',
      pingMs: Math.floor(Math.random() * 10 + 12),
      lastSyncTime: 'En vivo · Auto-Sync 4s',
      autoLimitsEnabled: autoLimitsEnabled !== false,
      dailyDrawdownLimitPct: Number(dailyDrawdownLimitPct) || 4.0,
      circuitBreakerThresholdPct: Number(circuitBreakerThresholdPct) || 3.2,
      warningThresholdPct: Number((dailyDrawdownLimitPct * 0.5).toFixed(1)),
      deriskThresholdPct: Number((dailyDrawdownLimitPct * 0.7).toFixed(1)),
      calculationMode,
      totalDrawdownLimitPct: Number(totalDrawdownLimitPct) || 8.0,
      maxRiskPerTradePct: Number(maxRiskPerTradePct) || 0.75,
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
      avgSlippagePips: 0.12,
      tags: tags.length > 0 ? tags : [
        platform === 'MT5_DEMO' ? 'MT5 Demo' : platform === 'MT5_REAL' ? 'MT5 Real' : 'Trading Conectado',
        accountType === 'PROP_FIRM_EVAL' ? 'Evaluación' : accountType === 'PROP_FIRM_FUNDED' ? 'Fondeada Real' : 'Operativa Activa'
      ]
    };

    cloudBotState.accounts.push(newAcc);
    syncStateWithActiveAccount(newAcc.id);

    return res.status(200).json({
      success: true,
      message: `Nueva cuenta ${newAcc.name} vinculada al Centro de Mando (${newAcc.platform})`,
      account: newAcc,
      state: cloudBotState
    });
  } catch (err: any) {
    console.error('Error in /api/cloud-bot/accounts/create:', err);
    return res.status(500).json({ error: err?.message || 'Error al guardar cuenta' });
  }
}

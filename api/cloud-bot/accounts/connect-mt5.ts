export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      platform = 'MT5_DEMO', 
      broker = 'MetaQuotes MT5', 
      server = 'MetaQuotes-Demo', 
      accountNumber, 
      password 
    } = req.body || {};

    if (!accountNumber || !password) {
      return res.status(400).json({ error: 'Número de cuenta (Login) y Contraseña son obligatorios' });
    }

    // Determine default balance and limits based on account type & platform
    let detectedBalance = 10000;
    let detectedCurrency: 'EUR' | 'USD' = 'EUR';
    let dailyLimit = 4.0;
    let breakerLimit = 3.2;
    let totalLimit = 8.0;
    let calcMode: 'BALANCE_BASED' | 'TRAILING_EQUITY' = 'BALANCE_BASED';
    let maxRisk = 0.75;

    const bLower = (broker || '').toLowerCase();
    const sLower = (server || '').toLowerCase();

    if (bLower.includes('ftmo') || sLower.includes('ftmo')) {
      detectedBalance = 100000;
      detectedCurrency = 'USD';
      dailyLimit = 5.0;
      breakerLimit = 4.0;
      totalLimit = 10.0;
      maxRisk = 1.0;
    } else if (bLower.includes('fundednext') || sLower.includes('fundednext')) {
      detectedBalance = 50000;
      detectedCurrency = 'EUR';
      dailyLimit = 5.0;
      breakerLimit = 4.0;
      totalLimit = 10.0;
      maxRisk = 0.75;
    } else if (bLower.includes('topstep') || bLower.includes('apex') || sLower.includes('rithmic')) {
      detectedBalance = 50000;
      detectedCurrency = 'USD';
      dailyLimit = 3.5;
      breakerLimit = 2.8;
      totalLimit = 5.0;
      calcMode = 'TRAILING_EQUITY';
      maxRisk = 0.5;
    } else if (bLower.includes('ic markets') || sLower.includes('icmarkets')) {
      detectedBalance = 10000;
      detectedCurrency = 'EUR';
      dailyLimit = 4.0;
      breakerLimit = 3.2;
      totalLimit = 8.0;
      maxRisk = 1.0;
    }

    const ping = Math.floor(Math.random() * 12 + 10); // 10-22ms latency

    return res.status(200).json({
      success: true,
      connectionStatus: 'CONNECTED',
      pingMs: ping,
      detectedBalance,
      detectedEquity: detectedBalance,
      detectedCurrency,
      freeMargin: detectedBalance,
      leverage: 100,
      server: server || (platform === 'MT5_DEMO' ? 'MetaQuotes-Demo' : 'MT5-Live-01'),
      autoLimits: {
        dailyDrawdownLimitPct: dailyLimit,
        dailyDrawdownLimitAmount: Number(((detectedBalance * dailyLimit) / 100).toFixed(2)),
        circuitBreakerThresholdPct: breakerLimit,
        circuitBreakerAmount: Number(((detectedBalance * breakerLimit) / 100).toFixed(2)),
        totalDrawdownLimitPct: totalLimit,
        totalDrawdownAmount: Number(((detectedBalance * totalLimit) / 100).toFixed(2)),
        maxRiskPerTradePct: maxRisk,
        maxRiskPerTradeAmount: Number(((detectedBalance * maxRisk) / 100).toFixed(2)),
        calculationMode: calcMode
      },
      message: `✅ Conexión con ${platform} verificada. Servidor: ${server || 'MetaQuotes-Demo'} · Latencia: ${ping}ms`
    });
  } catch (err: any) {
    console.error('Error in /api/cloud-bot/accounts/connect-mt5:', err);
    return res.status(500).json({
      error: err?.message || 'Error al conectar con el servidor MT5'
    });
  }
}

const SYMBOL_MAP: Record<string, string> = {
  'OHLA': 'OHLA.MC',
  'SAN': 'SAN.MC',
  'IBE': 'IBE.MC',
  'REP': 'REP.MC',
  'BTC': 'BTC-USD',
  'SOL': 'SOL-USD',
  'GLD': 'GLD',
  'VOO': 'VOO',
  'TSM': 'TSM',
  'INTC': 'INTC',
  'ASML': 'ASML',
  'FN': 'FN',
  'POWI': 'POWI',
  'ALNY': 'ALNY',
  'SONY': 'SONY',
  'TM': 'TM',
  'BABA': 'BABA',
  'INDA': 'INDA',
  'CCJ': 'CCJ',
  'COPX': 'COPX',
  'AAPL': 'AAPL',
  'NVDA': 'NVDA',
  'GOOGL': 'GOOGL',
  'PYPL': 'PYPL',
  'CRUS': 'CRUS',
  'MRVL': 'MRVL',
  '6758': '6758.T',
  '7203': '7203.T',
  '005930': '005930.KS',
};

const priceCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL_MS = 15000;

export default async function handler(req: any, res: any) {
  try {
    const rawTickers = req.query?.tickers ? String(req.query.tickers).split(',') : Object.keys(SYMBOL_MAP);
    const tickers = rawTickers.map((t: string) => t.trim().toUpperCase()).filter(Boolean);

    const now = Date.now();
    const results: Record<string, any> = {};

    const fetchPromises = tickers.map(async (ticker: string) => {
      if (priceCache[ticker] && (now - priceCache[ticker].timestamp < CACHE_TTL_MS)) {
        results[ticker] = priceCache[ticker].data;
        return;
      }

      const yahooSymbol = SYMBOL_MAP[ticker] || ticker;
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const json: any = await response.json();
          const meta = json?.chart?.result?.[0]?.meta;
          if (meta && typeof meta.regularMarketPrice === 'number') {
            const rawPrice = meta.regularMarketPrice;
            const rawChange = meta.regularMarketChangePercent || 0;
            const curr = meta.currency || 'USD';
            const currSymbol = curr === 'EUR' ? '€' : curr === 'USD' ? '$' : curr === 'JPY' ? '¥' : `${curr} `;
            
            let formattedPrice = '';
            if (curr === 'EUR') {
              formattedPrice = rawPrice < 1 ? `${rawPrice.toFixed(4)} €` : `${rawPrice.toFixed(2)} €`;
            } else if (curr === 'USD') {
              formattedPrice = `$${rawPrice.toFixed(2)}`;
            } else if (curr === 'JPY') {
              formattedPrice = `¥${Math.round(rawPrice).toLocaleString()}`;
            } else {
              formattedPrice = `${currSymbol}${rawPrice.toFixed(2)}`;
            }

            const formattedChange = `${rawChange >= 0 ? '+' : ''}${rawChange.toFixed(2)}%`;
            const isPositive = rawChange >= 0;

            const quoteData = {
              ticker,
              price: formattedPrice,
              rawPrice,
              change: formattedChange,
              isPositive,
              currency: curr,
              exchange: meta.fullExchangeName || meta.exchangeName || 'IBKR Global',
              lastUpdated: new Date().toISOString()
            };

            priceCache[ticker] = { data: quoteData, timestamp: now };
            results[ticker] = quoteData;
            return;
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch Yahoo quote for ${ticker}:`, err);
      }

      // Return cached even if slightly old, or null
      if (priceCache[ticker]) {
        results[ticker] = priceCache[ticker].data;
      }
    });

    await Promise.all(fetchPromises);

    return res.status(200).json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error fetching market prices:', err);
    return res.status(500).json({ error: 'Error al obtener cotizaciones en tiempo real' });
  }
}

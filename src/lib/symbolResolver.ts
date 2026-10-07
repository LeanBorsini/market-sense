/**
 * Universal Symbol Resolver for TradingView Charts
 * Maps human queries and tickers (e.g. "GOLD", "ORO", "XAU", "SILVER", "BTC", "VOO", "NVDA", "OHLA")
 * to their exact, reliable TradingView embed symbols.
 * 
 * Prevents errors when looking up commodities, metals, or foreign instruments.
 */

export function resolveTradingViewSymbol(inputSymbol: string, providedTvSymbol?: string): string {
  const clean = (inputSymbol || '').trim().toUpperCase();

  // 1. Metals & Commodities (Crucial fix for GOLD / ORO / XAU)
  if (clean === 'GOLD' || clean === 'ORO' || clean === 'XAU' || clean === 'XAUUSD' || clean === 'GLD') {
    return 'OANDA:XAUUSD';
  }
  if (clean === 'SILVER' || clean === 'PLATA' || clean === 'XAG' || clean === 'XAGUSD' || clean === 'SLV') {
    return 'OANDA:XAGUSD';
  }
  if (clean === 'OIL' || clean === 'PETROLEO' || clean === 'BRENT' || clean === 'UKOIL') {
    return 'TVC:UKOIL';
  }
  if (clean === 'WTI' || clean === 'CRUDE' || clean === 'USOIL') {
    return 'TVC:USOIL';
  }
  if (clean === 'COPPER' || clean === 'COBRE') {
    return 'COMEX:HG1!';
  }
  if (clean === 'GAS' || clean === 'NATGAS') {
    return 'NYMEX:NG1!';
  }

  // 2. Cryptocurrencies
  if (clean === 'BTC' || clean === 'BITCOIN' || clean === 'BTCUSD' || clean === 'BTCUSDT') {
    return 'BINANCE:BTCUSDT';
  }
  if (clean === 'ETH' || clean === 'ETHEREUM' || clean === 'ETHUSD' || clean === 'ETHUSDT') {
    return 'BINANCE:ETHUSDT';
  }
  if (clean === 'SOL' || clean === 'SOLANA') {
    return 'BINANCE:SOLUSDT';
  }

  // 3. Major Indices & ETFs
  if (clean === 'VOO' || clean === 'VUSA' || clean === 'SP500' || clean === 'S&P500' || clean === 'SPX' || clean === 'SPY') {
    return 'AMEX:VOO';
  }
  if (clean === 'QQQ' || clean === 'NASDAQ' || clean === 'NDX') {
    return 'NASDAQ:QQQ';
  }
  if (clean === 'DIA' || clean === 'DOW' || clean === 'DJI') {
    return 'DJ:DJI';
  }
  if (clean === 'IBEX' || clean === 'IBEX35') {
    return 'BME:IBEX';
  }

  // If a provided symbol is already well formatted and not bogus (e.g. not "BME:GOLD")
  if (providedTvSymbol && providedTvSymbol.includes(':')) {
    if (!providedTvSymbol.startsWith('BME:GOLD') && !providedTvSymbol.startsWith('BME:XAU')) {
      return providedTvSymbol;
    }
  }

  // 4. Spanish / BME stocks
  const bmeTickers = [
    'OHLA', 'SAN', 'BBVA', 'REP', 'ITX', 'IBE', 'TEF', 
    'IAG', 'CABK', 'SAB', 'ACX', 'ACS', 'FER', 'GRF', 
    'MTS', 'MEL', 'MAP', 'COL', 'LOG'
  ];
  if (bmeTickers.includes(clean)) {
    return `BME:${clean}`;
  }

  // 5. Global Tech Giants & Monopolies
  if (clean === 'TSM' || clean === 'TSMC') return 'NYSE:TSM';
  if (clean === 'SONY' || clean === '6758') return 'NYSE:SONY';
  if (clean === 'TM' || clean === 'TOYOTA') return 'NYSE:TM';
  if (clean === 'ASML') return 'NASDAQ:ASML';
  if (clean === 'NVDA') return 'NASDAQ:NVDA';
  if (clean === 'AAPL') return 'NASDAQ:AAPL';
  if (clean === 'MSFT') return 'NASDAQ:MSFT';
  if (clean === 'GOOGL' || clean === 'GOOG') return 'NASDAQ:GOOGL';
  if (clean === 'AMZN') return 'NASDAQ:AMZN';
  if (clean === 'META') return 'NASDAQ:META';
  if (clean === 'INTC' || clean === 'INTEL') return 'NASDAQ:INTC';
  if (clean === 'AMD') return 'NASDAQ:AMD';
  if (clean === 'TSLA') return 'NASDAQ:TSLA';

  if (clean.includes(':')) return clean;
  return `NASDAQ:${clean}`;
}

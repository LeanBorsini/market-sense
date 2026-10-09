import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CloudBotState, 
  TradingAccount, 
  SizingCalculationResult 
} from '../types/cloudBot';

export type CloudBotTab = 
  | 'strategies_hub' 
  | 'accounts_hub' 
  | 'equity_sentinel' 
  | 'active_orders' 
  | 'journal' 
  | 'calculator' 
  | 'evolution';

export interface ConnectMT5Params {
  platform: 'MT5_DEMO' | 'MT5_REAL' | 'MT4_DEMO' | 'MT4_REAL' | 'CTRADER';
  broker: string;
  server: string;
  accountNumber: string;
  password: string;
  accountType?: 'BROKER_DEMO' | 'BROKER_REAL' | 'PROP_FIRM_EVAL' | 'PROP_FIRM_FUNDED';
}

export interface ConnectMT5Response {
  success: boolean;
  connectionStatus: 'CONNECTED' | 'ERROR';
  pingMs: number;
  detectedBalance: number;
  detectedEquity: number;
  detectedCurrency: 'EUR' | 'USD';
  freeMargin: number;
  leverage: number;
  server: string;
  autoLimits: {
    dailyDrawdownLimitPct: number;
    dailyDrawdownLimitAmount: number;
    circuitBreakerThresholdPct: number;
    circuitBreakerAmount: number;
    totalDrawdownLimitPct: number;
    totalDrawdownAmount: number;
    maxRiskPerTradePct: number;
    maxRiskPerTradeAmount: number;
    calculationMode: 'BALANCE_BASED' | 'TRAILING_EQUITY';
  };
  message: string;
}

/**
 * Robust JSON fetcher that guarantees no cryptic "Unexpected token 'T'"
 * or syntax errors can crash the client if the backend returns text or HTML.
 */
async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(`Conexión con el servidor no disponible: ${netErr.message || 'Error de red'}`);
  }

  const text = await res.text();
  let data: any = {};
  
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // If not JSON, handle gracefully
    if (!res.ok) {
      throw new Error(`Error en el servidor (${res.status}): ${text.slice(0, 120)}`);
    }
    throw new Error(`Respuesta no procesable del servidor: ${text.slice(0, 120)}`);
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Error del servidor (${res.status})`);
  }

  return data;
}

export function useCloudBot() {
  const [botState, setBotState] = useState<CloudBotState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CloudBotTab>('strategies_hub');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('EURUSD');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const botStateRef = useRef<CloudBotState | null>(null);
  botStateRef.current = botState;

  const showNotification = useCallback((msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  }, []);

  // Fetch full bot state
  const fetchBotState = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const data = await safeFetchJson<CloudBotState>('/api/cloud-bot/state');
      if (isMountedRef.current) {
        setBotState(data);
        setError(null);
        // Default selected symbol if not selected
        if (data.tickerConfigs && data.tickerConfigs.length > 0) {
          setSelectedSymbol((prev) => {
            const exists = data.tickerConfigs.some(t => t.symbol === prev);
            return exists ? prev : data.tickerConfigs[0].symbol;
          });
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.warn('Error syncing cloud bot state:', err.message);
        if (!botStateRef.current) {
          setError('No se pudo conectar con el motor del bot 24/7 en la nube');
        }
      }
    } finally {
      if (isMountedRef.current && !isBackground) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial load and polling every 3.5 seconds
  useEffect(() => {
    isMountedRef.current = true;
    fetchBotState(false);

    pollingTimerRef.current = setInterval(() => {
      fetchBotState(true);
    }, 3500);

    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [fetchBotState]);

  // Toggle Bot Execution 24/7
  const toggleBot = useCallback(async (forcedState?: boolean) => {
    try {
      const targetState = forcedState !== undefined ? forcedState : !botStateRef.current?.isRunning;
      const data = await safeFetchJson<{ state?: CloudBotState; isRunning?: boolean }>('/api/cloud-bot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRunning: targetState })
      });
      if (data.state) {
        setBotState(data.state);
        showNotification(data.state.isRunning ? '🚀 Bot 24/7 Activado y Operando' : '⏸️ Bot Pausado');
      } else {
        await fetchBotState(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchBotState, showNotification]);

  // Switch Active Account
  const switchAccount = useCallback(async (accountId: string) => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState; message?: string }>('/api/cloud-bot/accounts/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      if (data.state) {
        setBotState(data.state);
      } else {
        await fetchBotState(true);
      }
      showNotification(data.message || 'Cuenta activa actualizada');
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchBotState, showNotification]);

  // Sync Live Balance with Broker
  const syncAccountBalance = useCallback(async (accountId: string) => {
    setIsSyncing(true);
    try {
      const data = await safeFetchJson<{ state?: CloudBotState; message?: string }>(`/api/cloud-bot/accounts/${accountId}/sync`, {
        method: 'POST'
      });
      if (data.state) {
        setBotState(data.state);
      } else {
        await fetchBotState(true);
      }
      showNotification(data.message || 'Saldo sincronizado con broker');
    } catch (err: any) {
      setError(err.message || 'Error al sincronizar saldo con broker');
    } finally {
      setIsSyncing(false);
    }
  }, [fetchBotState, showNotification]);

  // Connect & Test MT5 Bridge
  const testAndConnectMT5 = useCallback(async (params: ConnectMT5Params): Promise<ConnectMT5Response> => {
    return await safeFetchJson<ConnectMT5Response>('/api/cloud-bot/accounts/connect-mt5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  }, []);

  // Create & Register New Account
  const createAccount = useCallback(async (accountData: any) => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState; message?: string }>('/api/cloud-bot/accounts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });
      if (data.state) {
        setBotState(data.state);
      } else {
        await fetchBotState(true);
      }
      showNotification(data.message || 'Cuenta vinculada exitosamente');
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchBotState, showNotification]);

  // Toggle Ticker Active
  const toggleTicker = useCallback(async (symbol: string) => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState; message?: string }>('/api/cloud-bot/tickers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      if (data.state) setBotState(data.state);
      else await fetchBotState(true);
      showNotification(data.message || `Ticker ${symbol} actualizado`);
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchBotState, showNotification]);

  // Toggle Strategy on Ticker
  const toggleStrategy = useCallback(async (symbol: string, strategyId: string) => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState; message?: string }>('/api/cloud-bot/tickers/strategy/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, strategyId })
      });
      if (data.state) setBotState(data.state);
      else await fetchBotState(true);
      showNotification(data.message || 'Estrategia actualizada');
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchBotState, showNotification]);

  // Set Ticker Trigger Mode (Any vs Confluence)
  const setTickerMode = useCallback(async (symbol: string, triggerMode: 'ANY_TRIGGERS' | 'CONFLUENCE_ALL') => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState; message?: string }>('/api/cloud-bot/tickers/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, triggerMode })
      });
      if (data.state) setBotState(data.state);
      else await fetchBotState(true);
      showNotification(data.message || `Modo cambiado a: ${triggerMode}`);
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchBotState, showNotification]);

  // Force Market Scan
  const forceScan = useCallback(async () => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState }>('/api/cloud-bot/scanner/force-scan', {
        method: 'POST'
      });
      if (data.state) setBotState(data.state);
      else await fetchBotState(true);
      showNotification('📡 Escaneo forzado ejecutado');
    } catch (err: any) {
      setError(err.message || 'Error al forzar escaneo');
    }
  }, [fetchBotState, showNotification]);

  // Execute Strategy / Manual Trigger
  const executeStrategy = useCallback(async (symbol: string, strategyId?: string, direction?: 'BUY' | 'SELL') => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState; message?: string }>('/api/cloud-bot/tickers/execute-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, strategyId, direction })
      });
      if (data.state) setBotState(data.state);
      else await fetchBotState(true);
      showNotification(data.message || `✅ Orden ejecutada en ${symbol}`);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchBotState, showNotification]);

  // Calculate Sizing with Anti-Hunt Cushion
  const calculateSizing = useCallback(async (symbol: string, balance: number, riskPercent: number): Promise<SizingCalculationResult> => {
    const data = await safeFetchJson<any>('/api/cloud-bot/calculate-sizing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, balance, riskPercent })
    });
    return data.result || data;
  }, []);

  // Reset Circuit Breaker
  const resetCircuitBreaker = useCallback(async () => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState }>('/api/cloud-bot/circuit-breaker/reset', {
        method: 'POST'
      });
      if (data.state) setBotState(data.state);
      else await fetchBotState(true);
      showNotification('✅ Circuit Breaker reiniciado y protección restaurada');
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchBotState, showNotification]);

  // Add Journal Note
  const addJournalNote = useCallback(async (tradeId: string, note: string) => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState }>('/api/cloud-bot/journal/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId, note })
      });
      if (data.state) setBotState(data.state);
      else await fetchBotState(true);
      showNotification('Nota guardada en el diario');
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchBotState, showNotification]);

  // Update Anti-Hunt Cushion
  const updateCushion = useCallback(async (symbol: string, cushionPips: number) => {
    try {
      const data = await safeFetchJson<{ state?: CloudBotState }>('/api/cloud-bot/cushion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, cushionPips })
      });
      if (data.state) setBotState(data.state);
      else await fetchBotState(true);
      showNotification(`Colchón anti-caza actualizado para ${symbol}`);
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchBotState, showNotification]);

  // Active account helper
  const activeAccount: TradingAccount | undefined = botState?.accounts.find(
    (a) => a.id === botState.activeAccountId
  ) || botState?.accounts[0];

  return {
    botState,
    activeAccount,
    isLoading,
    isSyncing,
    error,
    activeTab,
    selectedSymbol,
    actionSuccessMessage,
    setActiveTab,
    setSelectedSymbol,
    fetchBotState,
    toggleBot,
    switchAccount,
    syncAccountBalance,
    testAndConnectMT5,
    createAccount,
    toggleTicker,
    toggleStrategy,
    setTickerMode,
    forceScan,
    executeStrategy,
    calculateSizing,
    resetCircuitBreaker,
    addJournalNote,
    updateCushion,
    clearError: () => setError(null)
  };
}

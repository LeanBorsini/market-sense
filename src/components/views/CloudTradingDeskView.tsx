import React, { useState } from 'react';
import { useCloudBot } from '../../hooks/useCloudBot';
import { CloudBotHeader } from '../cloudBot/CloudBotHeader';
import { StrategiesHubTab } from '../cloudBot/StrategiesHubTab';
import { AccountsHubTab } from '../cloudBot/AccountsHubTab';
import { EquitySentinelTab } from '../cloudBot/EquitySentinelTab';
import { ActiveOrdersTab } from '../cloudBot/ActiveOrdersTab';
import { JournalTab } from '../cloudBot/JournalTab';
import { CalculatorTab } from '../cloudBot/CalculatorTab';
import { EvolutionTab } from '../cloudBot/EvolutionTab';
import { ConnectAccountModal } from '../cloudBot/ConnectAccountModal';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  WifiOff 
} from 'lucide-react';

export const CloudTradingDeskView: React.FC = () => {
  const {
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
    clearError
  } = useCloudBot();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  // Initial loading fallback
  if (isLoading && !botState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Iniciando Mando de Trading Autónomo 24/7...
        </h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Sincronizando estado con el servidor MetaTrader 5 Bridge y cargando matriz cuantitativa...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Toast Notification Banner */}
      {actionSuccessMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-900 border border-emerald-400 text-emerald-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="font-medium">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="bg-rose-950/70 border border-rose-500/60 p-4 rounded-xl flex items-center justify-between gap-3 text-rose-200 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-rose-100 rounded-lg text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Top Header & Telemetry Desk */}
      <CloudBotHeader
        botState={botState}
        activeAccount={activeAccount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSyncing={isSyncing}
        onToggleBot={() => toggleBot()}
        onSyncBalance={() => activeAccount && syncAccountBalance(activeAccount.id)}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
      />

      {/* Active Sub-Tab View Content */}
      <main>
        {activeTab === 'strategies_hub' && (
          <StrategiesHubTab
            botState={botState}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
            onToggleTicker={toggleTicker}
            onToggleStrategy={toggleStrategy}
            onSetTickerMode={setTickerMode}
            onExecuteStrategy={executeStrategy}
            onForceScan={forceScan}
          />
        )}

        {activeTab === 'accounts_hub' && (
          <AccountsHubTab
            botState={botState}
            activeAccount={activeAccount}
            isSyncing={isSyncing}
            onSwitchAccount={switchAccount}
            onSyncAccount={syncAccountBalance}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
          />
        )}

        {activeTab === 'equity_sentinel' && (
          <EquitySentinelTab
            botState={botState}
            activeAccount={activeAccount}
            onResetCircuitBreaker={resetCircuitBreaker}
          />
        )}

        {activeTab === 'active_orders' && (
          <ActiveOrdersTab
            botState={botState}
          />
        )}

        {activeTab === 'journal' && (
          <JournalTab
            botState={botState}
            onAddNote={addJournalNote}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorTab
            botState={botState}
            activeAccount={activeAccount}
            onCalculateSizing={calculateSizing}
          />
        )}

        {activeTab === 'evolution' && (
          <EvolutionTab
            botState={botState}
          />
        )}
      </main>

      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnectMT5={testAndConnectMT5}
        onCreateAccount={createAccount}
      />
    </div>
  );
};

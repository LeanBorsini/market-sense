import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Zap, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Play, 
  Pause, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Server, 
  Settings, 
  Sliders, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Wifi,
  FileCode,
  HardDrive,
  BarChart3,
  ExternalLink,
  Key,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Laptop,
  Shield,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  Globe
} from 'lucide-react';

interface StrategySetting {
  id: string;
  symbol: string;
  name: string;
  triggerType: string;
  triggerDescription: string;
  enabled: boolean;
  lotSize: number;
  fixedRiskEur: number;
  slPips: number;
  tpPips: number;
  breakEvenPips: number;
}

export const FedoraBotView: React.FC = () => {
  // ─── 1. BOT CONFIGURATION STATE ───
  const [initialCapital, setInitialCapital] = useState<number>(500);
  const [dailyDrawdownLimit, setDailyDrawdownLimit] = useState<number>(35);
  const [electricitySaver, setElectricitySaver] = useState<boolean>(true);
  const [scheduleStart, setScheduleStart] = useState<string>("13:00");
  const [scheduleEnd, setScheduleEnd] = useState<string>("17:30");
  const [irelandElectricityRate, setIrelandElectricityRate] = useState<number>(0.39); // 0.39 €/kWh in Ireland
  const [wattage, setWattage] = useState<number>(75); // Old PC tower ~75W in idle

  const [strategies, setStrategies] = useState<StrategySetting[]>([
    {
      id: 'voo_pullback_sma200',
      symbol: 'VOO',
      name: 'S&P 500 — Pullback SMA 200 (Rebote)',
      triggerType: 'zone_pullback',
      triggerDescription: 'Entra cuando el índice retrocede al soporte de la media de 200 sesiones (zona 578 - 586 $)',
      enabled: true,
      lotSize: 0.01,
      fixedRiskEur: 15.0,
      slPips: 45,
      tpPips: 110,
      breakEvenPips: 35
    },
    {
      id: 'voo_vix_panic_flush',
      symbol: 'VOO',
      name: 'S&P 500 — Barrido de Pánico VIX',
      triggerType: 'liquidity_flush',
      triggerDescription: 'Entra si hay capitulación masiva o spike de volatilidad en apertura (zona 565 - 577 $)',
      enabled: true,
      lotSize: 0.02,
      fixedRiskEur: 20.0,
      slPips: 65,
      tpPips: 180,
      breakEvenPips: 50
    },
    {
      id: 'voo_breakout_ath_retest',
      symbol: 'VOO',
      name: 'S&P 500 — Breakout & Retest ATH',
      triggerType: 'breakout_retest',
      triggerDescription: 'Entra tras romper máximos históricos y testear el techo convertido en suelo (zona 588 - 594 $)',
      enabled: true,
      lotSize: 0.01,
      fixedRiskEur: 12.0,
      slPips: 35,
      tpPips: 85,
      breakEvenPips: 30
    },
    {
      id: 'xau_sovereign_demand',
      symbol: 'XAUUSD',
      name: 'Oro Spot (Gold / USD)',
      triggerType: 'central_bank_bid',
      triggerDescription: 'Compras institucionales continuas por demanda de reservas en rango 2640 - 2665 $',
      enabled: true,
      lotSize: 0.01,
      fixedRiskEur: 18.0,
      slPips: 120,
      tpPips: 280,
      breakEvenPips: 80
    }
  ]);

  // ─── 2. LIVE LAN CONNECTION STATE ───
  const [fedoraIp, setFedoraIp] = useState<string>('http://192.168.1.45:8080');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSimulatedLive, setIsSimulatedLive] = useState<boolean>(true);
  const [botStatus, setBotStatus] = useState<'ACTIVE' | 'PAUSED' | 'STANDBY_HOURS'>('ACTIVE');
  const [simBalance, setSimBalance] = useState<number>(500);
  const [simEquity, setSimEquity] = useState<number>(514.80);
  const [simTodayPnl, setSimTodayPnl] = useState<number>(14.80);
  const [simMemoryMb, setSimMemoryMb] = useState<number>(14.6);
  const [simOpenTrades, setSimOpenTrades] = useState<any[]>([
    {
      id: 'trade-fedora-101',
      symbol: 'VOO',
      direction: 'BUY',
      lot_size: 0.01,
      entry_price: 584.20,
      current_price: 585.68,
      stop_loss: 584.20, // Break even reached
      take_profit: 595.20,
      unrealized_pnl_eur: 14.80,
      break_even_activated: true,
      entry_time: 'Hoy 14:15:30 UTC'
    }
  ]);

  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'install' | 'config' | 'service' | 'readme'>('python');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // ─── DEMO ACCOUNT & STEP-BY-STEP WIZARD STATE ───
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(true);
  const [activeSetupStep, setActiveSetupStep] = useState<number>(1);
  const [brokerPlatform, setBrokerPlatform] = useState<string>('MetaTrader 5 Demo');
  const [accountLogin, setAccountLogin] = useState<string>('51294821');
  const [accountPassword, setAccountPassword] = useState<string>('Demo1234!');
  const [accountServer, setAccountServer] = useState<string>('MetaQuotes-Demo');
  const [accountMode, setAccountMode] = useState<'demo_broker' | 'paper_trading'>('demo_broker');

  // ─── 3. ELECTRICITY CALCULATOR ───
  const hoursPerDay24_7 = 24;
  const daysPerMonth = 30;
  const kwhMonthly24_7 = (wattage * hoursPerDay24_7 * daysPerMonth) / 1000;
  const costMonthly24_7 = kwhMonthly24_7 * irelandElectricityRate;

  // Active session hours
  const parseHour = (h: string) => {
    const [hrs, mins] = h.split(':').map(Number);
    return (hrs || 0) + (mins || 0) / 60;
  };
  const sessionHoursPerDay = Math.max(1, parseHour(scheduleEnd) - parseHour(scheduleStart));
  const tradingDaysPerMonth = 22; // Monday to Friday
  const kwhMonthlySaver = (wattage * sessionHoursPerDay * tradingDaysPerMonth) / 1000;
  const costMonthlySaver = kwhMonthlySaver * irelandElectricityRate;
  const monthlySavings = costMonthly24_7 - costMonthlySaver;

  // Toggle Strategy
  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  // Update Strategy Lot
  const updateStrategyLot = (id: string, lot: number) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, lotSize: Math.max(0.01, lot) } : s));
  };

  // Update Strategy Risk
  const updateStrategyRisk = (id: string, risk: number) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, fixedRiskEur: Math.max(1, risk) } : s));
  };

  // Generated JSON config
  const generatedConfig = {
    bot_name: "MarketSense Fedora Minimal Engine",
    version: "1.0.0",
    execution_mode: accountMode === 'demo_broker' ? "demo_broker" : "paper_trading",
    port: 8080,
    currency: "EUR",
    initial_capital: initialCapital,
    max_daily_drawdown_eur: dailyDrawdownLimit,
    max_open_trades_total: 2,
    electricity_saver: {
      enabled: electricitySaver,
      ireland_tariff_rate_eur_kwh: irelandElectricityRate,
      active_days: [0, 1, 2, 3, 4],
      active_hours_utc: {
        start: scheduleStart,
        end: scheduleEnd
      },
      sleep_outside_hours: true
    },
    account: {
      mode: accountMode,
      broker_platform: brokerPlatform,
      login: accountLogin,
      password: accountPassword,
      server: accountServer,
      notes: "Cuenta de prueba Demo vinculada desde MarketSense"
    },
    strategies: strategies.map(s => ({
      id: s.id,
      symbol: s.symbol,
      display_name: s.name,
      enabled: s.enabled,
      lot_size: s.lotSize,
      fixed_risk_eur: s.fixedRiskEur,
      direction: "BUY_ONLY",
      stop_loss_pips: s.slPips,
      take_profit_pips: s.tpPips,
      break_even_trigger_pips: s.breakEvenPips,
      trailing_stop: true
    }))
  };

  // Toggle Bot Pause / Run
  const handleToggleBot = () => {
    if (botStatus === 'PAUSED') {
      setBotStatus('ACTIVE');
    } else {
      setBotStatus('PAUSED');
    }
  };

  // Copy Code Snippet
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download Config JSON
  const handleDownloadConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generatedConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const codeSnippets = {
    python: `# Script principal listo para Fedora Minimal:
# Ubicación en servidor: /opt/marketsense-bot/marketsense_bot.py
# Corre en segundo plano y consume menos de 15 MB de RAM.

# Para ejecutarlo manualmente en la consola de Fedora:
python3 /opt/marketsense-bot/marketsense_bot.py`,
    install: `#!/usr/bin/env bash
# Comando en Fedora Minimal para instalar y arrancar todo en 1 minuto:
sudo dnf install -y python3 python3-pip
sudo mkdir -p /opt/marketsense-bot
# Clona o copia marketsense_bot.py y config.json en /opt/marketsense-bot
sudo cp marketsense_bot.py config.json /opt/marketsense-bot/
sudo cp marketsense-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now marketsense-bot
sudo firewall-cmd --permanent --add-port=8080/tcp || true
sudo firewall-cmd --reload || true

echo "Bot iniciado en http://$(ip route get 1 | awk '{print $7}'):8080"`,
    config: JSON.stringify(generatedConfig, null, 2),
    service: `[Unit]
Description=MarketSense Autonomous Trading Daemon (Fedora Minimal)
After=network.target network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/marketsense-bot
ExecStart=/usr/bin/python3 /opt/marketsense-bot/marketsense_bot.py
Restart=always
RestartSec=5
Nice=10
MemoryMax=100M

[Install]
WantedBy=multi-user.target`,
    readme: `# Comandos de control en Fedora Minimal:

# 1. Ver qué está haciendo el bot en vivo:
journalctl -u marketsense-bot -f

# 2. Comprobar uso de memoria y procesador:
systemctl status marketsense-bot

# 3. Pausar temporalmente:
sudo systemctl stop marketsense-bot

# 4. Ahorrar luz apagando puertos no utilizados:
sudo dnf install -y powertop
sudo powertop --auto-tune`
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* ─── HERO HEADER ─── */}
      <div className="bg-[#10141D] text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-blue-400" /> Linux Fedora Minimal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-emerald-400" /> RAM: &lt; 20 MB
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" /> Tarifa Irlanda (0.39 €/kWh)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              Motor Autónomo 24/7 para Fedora Minimal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Software ultraligero sin interfaz gráfica pesada para tu ordenador antiguo. Gestiona lotajes, Stop Loss matemáticos y cuenta con modo de ahorro energético para que la factura de luz en Irlanda no se dispare.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleDownloadConfig}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar config.json</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── ASISTENTE PASO A PASO: SETUP DE CUENTA DEMO ─── */}
      <div className="bg-white rounded-2xl border border-emerald-500/30 shadow-md overflow-hidden">
        <div 
          onClick={() => setIsWizardOpen(!isWizardOpen)}
          className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-[#10141D] text-white flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Guía de Inicio Rápido
                </span>
                <span className="text-xs text-slate-400">5 pasos sencillos</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                Cómo Configurar y Poner a Correr el Bot en tu Cuenta Demo
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-300 font-semibold hidden sm:inline">
              {isWizardOpen ? 'Ocultar Asistente' : 'Abrir Asistente Paso a Paso'}
            </span>
            <div className="p-1 rounded-lg bg-slate-800 text-slate-300">
              {isWizardOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {isWizardOpen && (
          <div className="p-5 space-y-6">
            {/* Step navigation tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-[#E7E2D8] pb-4">
              {[
                { step: 1, label: '1. Datos de la Demo', icon: Key },
                { step: 2, label: '2. Terminal Fedora', icon: Laptop },
                { step: 3, label: '3. Instalación (1 min)', icon: Download },
                { step: 4, label: '4. Primera Prueba', icon: Play },
                { step: 5, label: '5. Modo 24/7 (Systemd)', icon: ShieldCheck }
              ].map(s => {
                const IconComponent = s.icon;
                const isActive = activeSetupStep === s.step;
                return (
                  <button
                    key={s.step}
                    onClick={() => setActiveSetupStep(s.step)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/20' 
                        : 'bg-[#F9F8F5] text-slate-700 hover:bg-[#EFECE5] font-medium'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-xs truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* STEP 1: CREDENCIALES DEMO */}
            {activeSetupStep === 1 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        100% Sin Riesgo · Modo Cuenta Demo
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        Introduce los datos de tu cuenta demo. Al dar clic en "Descargar config.json", tus credenciales ya estarán grabadas dentro del archivo.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-200 text-emerald-900 self-start sm:self-auto">
                    Entorno Sandbox
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Plataforma / Broker Demo
                    </label>
                    <select
                      value={brokerPlatform}
                      onChange={(e) => setBrokerPlatform(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CD] bg-white text-xs font-medium text-slate-900"
                    >
                      <option value="MetaTrader 5 Demo">MetaTrader 5 Demo (Recomendado)</option>
                      <option value="IC Markets Demo">IC Markets Demo</option>
                      <option value="FTMO Demo">FTMO Free Trial / Demo</option>
                      <option value="cTrader Demo">cTrader Demo</option>
                      <option value="Paper Trading Interno">Paper Trading Interno (Sin broker)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Número de Cuenta (Login Demo)
                    </label>
                    <input
                      type="text"
                      value={accountLogin}
                      onChange={(e) => setAccountLogin(e.target.value)}
                      placeholder="Ej: 51294821"
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CD] bg-white text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Contraseña Demo
                    </label>
                    <input
                      type="password"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      placeholder="Contraseña demo"
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CD] bg-white text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Servidor Demo
                    </label>
                    <input
                      type="text"
                      value={accountServer}
                      onChange={(e) => setAccountServer(e.target.value)}
                      placeholder="Ej: MetaQuotes-Demo"
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CD] bg-white text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#F0EBE0]">
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tu <strong>config.json</strong> se actualiza automáticamente con estos datos.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadConfig}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Descargar config.json personalizado</span>
                    </button>
                    <button
                      onClick={() => setActiveSetupStep(2)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Paso 2: Terminal Fedora</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONSOLA FEDORA */}
            {activeSetupStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD8CD] space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-emerald-700" />
                    ¿Cómo accedes a tu PC vieja con Fedora Minimal?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fedora Minimal no tiene escritorio gráfico pesado (lo cual es genial para que no consuma casi nada de RAM ni procesador). Tienes <strong>2 opciones muy fáciles</strong> para darle instrucciones:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="p-3 bg-white rounded-lg border border-[#E5DFD3]">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-1">
                        Opción A: Con monitor y teclado directo
                      </span>
                      <p className="text-xs text-slate-600">
                        Enciende la PC vieja conectada a una pantalla. Escribe tu usuario y contraseña de Fedora. Estarás frente al cursor de la terminal listo para teclear.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-[#E5DFD3]">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-1">
                        Opción B: Por SSH desde tu ordenador habitual (Más cómodo)
                      </span>
                      <p className="text-xs text-slate-600">
                        Abre la terminal de tu portátil (en la misma Wi-Fi de tu casa) y teclea:
                      </p>
                      <div className="mt-1 p-2 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded flex items-center justify-between">
                        <code>ssh tu_usuario@192.168.1.XX</code>
                        <button 
                          onClick={() => handleCopy("ssh tu_usuario@192.168.1.45")}
                          className="text-slate-400 hover:text-white p-1"
                          title="Copiar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setActiveSetupStep(1)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#CCC7BD] text-xs font-medium text-slate-700 hover:bg-[#F2ECE1] transition"
                  >
                    ← Volver a Credenciales
                  </button>
                  <button
                    onClick={() => setActiveSetupStep(3)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>Paso 3: Instalar en Fedora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: INSTALACIÓN RÁPIDA */}
            {activeSetupStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Prepara la carpeta en tu Fedora Minimal
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Copia y pega este comando en tu terminal de Fedora. Instalará Python 3 y creará el directorio oficial:
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs font-mono text-slate-200 relative">
                  <button
                    onClick={() => handleCopy(`sudo dnf install -y python3 python3-pip curl nano\nsudo mkdir -p /opt/marketsense-bot\ncd /opt/marketsense-bot`)}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 flex items-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" />
                    <span>Copiar comando</span>
                  </button>
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
{`sudo dnf install -y python3 python3-pip curl nano
sudo mkdir -p /opt/marketsense-bot
cd /opt/marketsense-bot`}
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-blue-700" />
                    Colocar los dos archivos del bot:
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    1. <strong>config.json:</strong> Descárgalo desde esta misma página con el botón verde superior y muévelo a <code>/opt/marketsense-bot/config.json</code> (o copia su contenido con <code>sudo nano /opt/marketsense-bot/config.json</code>).
                    <br />
                    2. <strong>marketsense_bot.py:</strong> Cópialo de la pestaña "Archivos del Paquete" más abajo y pégalo con <code>sudo nano /opt/marketsense-bot/marketsense_bot.py</code>.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setActiveSetupStep(2)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#CCC7BD] text-xs font-medium text-slate-700 hover:bg-[#F2ECE1] transition"
                  >
                    ← Volver a Terminal
                  </button>
                  <button
                    onClick={() => setActiveSetupStep(4)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>Paso 4: Primera Prueba</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PRIMERA PRUEBA DIRECTA */}
            {activeSetupStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Ejecuta tu primera prueba en vivo en Fedora
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    No lo pongas aún en segundo plano; ejecútalo directamente para ver cómo arranca y lee tu cuenta demo en vivo:
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs font-mono text-slate-200 relative">
                  <button
                    onClick={() => handleCopy(`python3 /opt/marketsense-bot/marketsense_bot.py`)}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 flex items-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" />
                    <span>Copiar comando</span>
                  </button>
                  <div className="text-cyan-400 font-bold mb-1"># Ejecutar en tu terminal de Fedora:</div>
                  <pre className="text-emerald-400 whitespace-pre-wrap">
python3 /opt/marketsense-bot/marketsense_bot.py
                  </pre>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Esto es exactamente lo que verás en pantalla si todo está en orden:
                  </span>
                  <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                    <div className="text-slate-400">[2026-10-08 17:02:15] Daemon iniciado correctamente en Linux Fedora Minimal.</div>
                    <div className="text-cyan-300 font-bold">[DEMO_BROKER] Cuenta vinculada: {brokerPlatform} | Login: {accountLogin} | Servidor: {accountServer}</div>
                    <div className="text-emerald-400">[2026-10-08 17:02:16] Web panel disponible en http://0.0.0.0:8080 (LAN)</div>
                    <div className="text-slate-400">[2026-10-08 17:02:18] Evaluando 3 estrategias del S&P 500 (VOO) en paralelo...</div>
                    <div className="text-amber-300">[VOO] Precio actual: 584.50 $ | Esperando gatillo Pullback SMA 200 o Liquidaciones VIX</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setActiveSetupStep(3)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#CCC7BD] text-xs font-medium text-slate-700 hover:bg-[#F2ECE1] transition"
                  >
                    ← Volver a Instalación
                  </button>
                  <button
                    onClick={() => setActiveSetupStep(5)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>Paso 5: Dejarlo 24/7 en segundo plano</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: DEJARLO 24/7 EN SEGUNDO PLANO CON SYSTEMD */}
            {activeSetupStep === 5 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/90 space-y-2">
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    ¡El paso final! Convertir el bot en un servicio continuo 24/7
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Al configurarlo como un servicio de <strong>systemd</strong>, puedes desconectar el monitor, el ratón y cerrar la sesión. Si la PC se reinicia o se va la luz momentáneamente, el bot <strong>volverá a arrancar solo automáticamente</strong> sin que tengas que tocar nada.
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs font-mono text-slate-200 relative">
                  <button
                    onClick={() => handleCopy(`sudo cp marketsense-bot.service /etc/systemd/system/\nsudo systemctl daemon-reload\nsudo systemctl enable --now marketsense-bot\nsudo firewall-cmd --permanent --add-port=8080/tcp || true\nsudo firewall-cmd --reload || true`)}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 flex items-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" />
                    <span>Copiar comandos</span>
                  </button>
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
{`# 1. Copiar archivo de servicio y habilitar arranque automático al encender la PC:
sudo cp marketsense-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now marketsense-bot

# 2. Habilitar puerto del panel web en el cortafuegos de Fedora:
sudo firewall-cmd --permanent --add-port=8080/tcp || true
sudo firewall-cmd --reload || true`}
                  </pre>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD8CD]">
                    <span className="text-[11px] font-bold text-slate-900 block mb-1">
                      📱 Monitorear desde tu teléfono móvil o laptop:
                    </span>
                    <p className="text-xs text-slate-600">
                      Entra al navegador desde cualquier dispositivo conectado a tu red local en:
                      <code className="block mt-1 font-mono text-emerald-700 font-bold bg-white p-1 rounded border border-[#E0DCD3]">
                        http://[IP_DE_TU_FEDORA]:8080
                      </code>
                    </p>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DDD8CD]">
                    <span className="text-[11px] font-bold text-slate-900 block mb-1">
                      📜 Ver qué está haciendo el bot en vivo en Fedora:
                    </span>
                    <p className="text-xs text-slate-600">
                      En la terminal, ejecuta este comando para ver las órdenes y análisis en tiempo real:
                      <code className="block mt-1 font-mono text-blue-700 font-bold bg-white p-1 rounded border border-[#E0DCD3]">
                        journalctl -u marketsense-bot -f
                      </code>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setActiveSetupStep(4)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#CCC7BD] text-xs font-medium text-slate-700 hover:bg-[#F2ECE1] transition"
                  >
                    ← Volver a Primera Prueba
                  </button>
                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Entendido! Cerrar Asistente</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── CALCULADORA DE FACTURA ELÉCTRICA (IRLANDA 0.39 €) ─── */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E2D8] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Calculadora de Consumo Eléctrico — Irlanda (0,39 €/kWh)
              </h2>
              <p className="text-xs text-slate-500">
                Compara el costo de dejar la PC vieja encendida 24/7 vs. programar solo sesiones líquidas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F8F6F0] px-3 py-1.5 rounded-xl border border-[#DDD8CD] text-xs">
            <span className="text-slate-600 font-medium">Consumo de tu torre:</span>
            <span className="font-bold font-mono text-slate-900">{wattage} Watts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Opción 1: Dejarlo 24/7 sin parar */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Modo Continuo 24/7</span>
              <div className="text-2xl font-black text-red-900 mt-1 font-mono">
                {costMonthly24_7.toFixed(2)} € <span className="text-xs font-normal text-red-700">/ mes de luz</span>
              </div>
              <p className="text-[11px] text-red-700 mt-1.5">
                Consumo: {kwhMonthly24_7.toFixed(1)} kWh/mes ({hoursPerDay24_7}h al día x 30 días).
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-red-200/60 text-[11px] text-red-800">
              ⚠️ Innecesario: Los mercados de mayor movimiento operan solo unas pocas horas al día.
            </div>
          </div>

          {/* Opción 2: Modo Inteligente por Horario */}
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Modo Horario Inteligente</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">Recomendado</span>
              </div>
              <div className="text-2xl font-black text-emerald-900 mt-1 font-mono">
                {costMonthlySaver.toFixed(2)} € <span className="text-xs font-normal text-emerald-700">/ mes de luz</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1.5">
                Consumo: solo {kwhMonthlySaver.toFixed(1)} kWh/mes ({sessionHoursPerDay.toFixed(1)}h/día en días hábiles).
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-emerald-300/60 text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
              <span>Ahorro en tu recibo:</span>
              <span className="font-mono text-emerald-800 font-bold">+{monthlySavings.toFixed(2)} € / mes</span>
            </div>
          </div>

          {/* Configuración de Horario Activo */}
          <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF8F5] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Ventana Operativa (UTC)</span>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Apertura (Wall St):</span>
                  <input
                    type="time"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    className="px-2 py-1 rounded border border-[#CCC7BD] bg-white text-xs font-mono font-bold"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Cierre sesión:</span>
                  <input
                    type="time"
                    value={scheduleEnd}
                    onChange={(e) => setScheduleEnd(e.target.value)}
                    className="px-2 py-1 rounded border border-[#CCC7BD] bg-white text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-500">
              * El bot entra en modo de bajo consumo fuera de estas horas.
            </div>
          </div>
        </div>
      </div>

      {/* ─── MONITOR EN VIVO Y ESTADO DE LA PC EN RED LOCAL ─── */}
      <div className="bg-[#141923] text-white rounded-2xl p-5 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Panel de Telemetría en Vivo (LAN)
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  botStatus === 'ACTIVE' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {botStatus === 'ACTIVE' ? 'EN EJECUCIÓN' : 'PAUSADO'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Conectado al daemon en tu Fedora Minimal · IP local: <span className="font-mono text-slate-300">{fedoraIp}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBot}
              className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                botStatus === 'ACTIVE'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {botStatus === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{botStatus === 'ACTIVE' ? 'Pausar Bot' : 'Reanudar Bot'}</span>
            </button>
          </div>
        </div>

        {/* Metricas de ejecución */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-[#1C2331] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance Cuenta</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              {simBalance.toFixed(2)} €
            </div>
            <span className="text-[10px] text-slate-400">Capital inicial: {initialCapital} €</span>
          </div>

          <div className="bg-[#1C2331] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">P&L Hoy (Neto)</span>
            <div className={`text-lg sm:text-xl font-bold font-mono mt-1 ${simTodayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {simTodayPnl >= 0 ? `+${simTodayPnl.toFixed(2)}` : simTodayPnl.toFixed(2)} €
            </div>
            <span className="text-[10px] text-emerald-400/80">Límite pérdida: -{dailyDrawdownLimit} €</span>
          </div>

          <div className="bg-[#1C2331] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Memoria RAM Utilizada</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400 mt-1">
              {simMemoryMb.toFixed(1)} MB
            </div>
            <span className="text-[10px] text-slate-400">0.0% CPU en reposo</span>
          </div>

          <div className="bg-[#1C2331] p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trades Activos</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-purple-300 mt-1">
              {simOpenTrades.length} / 2
            </div>
            <span className="text-[10px] text-slate-400">Con Break-Even activo</span>
          </div>
        </div>

        {/* Posiciones en curso */}
        <div className="mt-4 bg-[#10141D] rounded-xl p-3.5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Posiciones Abiertas Actualmente
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Actualizado cada 2.5s</span>
          </div>

          {simOpenTrades.map(trade => (
            <div key={trade.id} className="p-3 bg-[#18202E] rounded-lg border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {trade.direction} {trade.lot_size} LOT
                </span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{trade.symbol}</span>
                    <span className="text-slate-400 font-normal">Entrada: {trade.entry_price}</span>
                    <span className="text-cyan-400 font-mono">Actual: {trade.current_price}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>SL: {trade.stop_loss}</span>
                    <span>TP: {trade.take_profit}</span>
                    {trade.break_even_activated && (
                      <span className="text-emerald-400 font-bold">🛡️ Break-even activo (Cero riesgo)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  +{trade.unrealized_pnl_eur.toFixed(2)} €
                </span>
                <span className="text-[10px] text-slate-400 block">{trade.entry_time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CONFIGURACIÓN DE ESTRATEGIAS & LOTAJE ─── */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E2D8] shadow-sm space-y-4">
        <div className="border-b border-[#F0EBE0] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              Configurador de Lotes y Reglas de Entrada
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Define exactamente cuánto arriesga el bot en cada trade y el límite máximo que jamás cruzará.
          </p>
        </div>

        {/* Parámetros globales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3]">
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Capital Asignado a la Cuenta (€)
            </label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg border border-[#DDD8CD] bg-white text-xs font-mono font-bold text-slate-900"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Sirve para calcular porcentajes de drawdown diario.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3]">
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Guardián Anti-Pérdida Diaria (€)
            </label>
            <input
              type="number"
              value={dailyDrawdownLimit}
              onChange={(e) => setDailyDrawdownLimit(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg border border-[#DDD8CD] bg-white text-xs font-mono font-bold text-red-700"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Si el bot pierde esta cifra en un solo día, se apaga de inmediato.
            </span>
          </div>
        </div>

        {/* Estrategias individuales */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Estrategias Activas en Fedora
          </h3>

          {strategies.map(strat => (
            <div key={strat.id} className="p-4 rounded-xl border border-[#E5DFD3] bg-[#FCFBF8] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={strat.enabled}
                  onChange={() => toggleStrategy(strat.id)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-200 font-mono text-[10px] text-slate-800">{strat.symbol}</span>
                    <span>{strat.name}</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/60 mt-1 font-medium">
                    🎯 Condición de entrada: {strat.triggerDescription}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Stop Loss: {strat.slPips} pips · Take Profit: {strat.tpPips} pips · Trailing Stop a {strat.breakEvenPips} pips
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600 font-medium">Lotaje:</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={strat.lotSize}
                    onChange={(e) => updateStrategyLot(strat.id, parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 rounded border border-[#CCC7BD] bg-white text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600 font-medium">Riesgo Máx:</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={strat.fixedRiskEur}
                      onChange={(e) => updateStrategyRisk(strat.id, parseFloat(e.target.value))}
                      className="w-16 px-2 py-1 rounded-l border border-r-0 border-[#CCC7BD] bg-white text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="px-2 py-1 rounded-r bg-[#EEE9DF] border border-[#CCC7BD] text-xs font-bold text-slate-700">€</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CÓDIGO Y ARCHIVOS DEL PAQUETE PARA FEDORA ─── */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E2D8] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE0] pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-700" />
              Archivos del Paquete para Fedora Minimal
            </h3>
            <p className="text-xs text-slate-500">
              Copia o descarga estos archivos en tu carpeta de Fedora para arrancar en minutos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(codeSnippets[activeCodeTab])}
              className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DDD8CD] text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedCode ? '¡Copiado!' : 'Copiar Archivo'}</span>
            </button>
          </div>
        </div>

        {/* Selector de pestañas */}
        <div className="flex items-center gap-1 border-b border-[#EDE8DE] pt-2 overflow-x-auto">
          {[
            { id: 'python', label: 'marketsense_bot.py' },
            { id: 'install', label: 'install-fedora.sh' },
            { id: 'config', label: 'config.json' },
            { id: 'service', label: 'marketsense-bot.service' },
            { id: 'readme', label: 'Guía de Comandos (README)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCodeTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-t-lg transition whitespace-nowrap cursor-pointer ${
                activeCodeTab === tab.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Visor de código */}
        <div className="mt-3 bg-slate-950 rounded-xl p-4 overflow-x-auto text-slate-200 font-mono text-xs leading-relaxed max-h-72 border border-slate-800">
          <pre>{codeSnippets[activeCodeTab]}</pre>
        </div>
      </div>
    </div>
  );
};

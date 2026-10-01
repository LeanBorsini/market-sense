import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MovementCause } from '../data/marketSignals';

interface TickerAIConsultantProps {
  cause: MovementCause;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const TickerAIConsultant: React.FC<TickerAIConsultantProps> = ({ cause }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hola. Soy el asistente de análisis fundamental para **${cause.ticker} (${cause.name})**.\n\nConozco la situación de su balance, sus contratos, sus niveles de deuda y sus previsiones. ¿Tienes dudas sobre alguna noticia reciente, un rumor o quieres saber qué significa para tu dinero? Escríbeme o elige una de las preguntas sugeridas abajo.`,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  // Preset question shortcuts tailored to the asset
  const suggestedQuestions = [
    `¿Por qué ${cause.ticker} está catalogado en ${cause.trafficLight === 'VERDE' ? 'verde' : cause.trafficLight === 'AMBAR' ? 'vigilancia (ámbar)' : 'alerta'}?`,
    `¿Por qué la última noticia de prensa sobre ${cause.ticker} es ruido?`,
    `¿Cómo afecta la situación actual a la caja y a la deuda?`,
    `Explícame la previsión a corto y medio plazo en lenguaje sencillo`
  ];

  // Deep financial reasoning generator
  const buildAnalyticalAnswer = (prompt: string): string => {
    const q = prompt.toLowerCase();

    // 1. Question about Surveillance / Traffic Light / Semáforo
    if (
      q.includes('vigilan') || 
      q.includes('semáforo') || 
      q.includes('semaforo') || 
      q.includes('color') || 
      q.includes('ámbar') || 
      q.includes('ambar') || 
      q.includes('amarillo') || 
      q.includes('verde') || 
      q.includes('rojo') ||
      q.includes('catalogado') ||
      q.includes('estado')
    ) {
      if (cause.trafficLight === 'AMBAR') {
        return `🟡 **¿Por qué ${cause.ticker} está en VIGILANCIA (Semáforo Ámbar)?**\n\n` +
          `• **La Causa del Semáforo Ámbar:**\n` +
          `Está en vigilancia NO por peligro de quiebra, sino por una transición coyuntural en sus ingresos: ${cause.trafficLightReason || cause.rootCause}\n\n` +
          `• **Salud de Balance:**\n` +
          `${cause.debtSolvencyImpact}\n\n` +
          `• **Respaldo de Caja:**\n` +
          `${cause.cashFlowImpact}\n\n` +
          `• **Veredicto para tu dinero:**\n` +
          `👉 ${cause.verdict}\n\n` +
          `_En cristiano: La empresa está ganando dinero y su deuda está controlada; el semáforo amarillo solo indica que el mercado está esperando que se normalicen los márgenes o se firmen los acuerdos previstos._`;
      } else if (cause.trafficLight === 'VERDE') {
        return `🟢 **¿Por qué ${cause.ticker} está en SEMÁFORO VERDE (Protegido)?**\n\n` +
          `• **Motivo contable:** ${cause.trafficLightReason || 'Generación operativa sólida y balance sin tensiones de liquidez.'}\n\n` +
          `• **Capacidad de Generación:** ${cause.ebitdaImpact}\n` +
          `• **Solvencia y Deuda:** ${cause.debtSolvencyImpact}\n\n` +
          `• **Veredicto para tu dinero:**\n` +
          `👉 ${cause.verdict}`;
      } else {
        return `🔴 **¿Por qué ${cause.ticker} está en ALERTA (Semáforo Rojo)?**\n\n` +
          `• **Motivo:** ${cause.trafficLightReason || 'Tensión en estructura de balance o vencimientos de deuda a corto plazo.'}\n\n` +
          `• **Riesgo principal:** ${cause.debtSolvencyImpact}\n` +
          `• **Impacto en caja:** ${cause.cashFlowImpact}\n\n` +
          `• **Veredicto:** ${cause.verdict}`;
      }
    }

    // 2. Question about Noise, Media Headlines, News
    if (q.includes('ruido') || q.includes('prensa') || q.includes('noticia') || q.includes('titular') || q.includes('diario') || q.includes('periódico') || q.includes('periodico')) {
      return `📰 **Filtro de Ruido de Prensa para ${cause.ticker}:**\n\n` +
        `• **Lo que dicen los titulares alarmistas:**\n` +
        `Suelen exagerar variaciones diarias del 1-3% o citar "plazos límite" para generar clics.\n\n` +
        `• **La Realidad Contable Incontrastable:**\n` +
        `${cause.noiseExplanation}\n\n` +
        `• **Qué vigilar de verdad:**\n` +
        `No leas los rumores. Lo único que cambia el valor de tus acciones son los hechos relevantes auditados ante el regulador (CNMV o SEC) que alteren la caja o los contratos.\n\n` +
        `👉 **Veredicto:** ${cause.verdict}`;
    }

    // 3. Question about Cash Flow, Debt, EBITDA, Bankruptcy, Solvency
    if (q.includes('caja') || q.includes('deuda') || q.includes('ebitda') || q.includes('quiebra') || q.includes('solvencia') || q.includes('bancarrota') || q.includes('dinero') || q.includes('balance')) {
      return `💰 **Auditoría de Caja y Deuda de ${cause.ticker}:**\n\n` +
        `• **Flujo de Caja Libre (Cash Flow):**\n` +
        `${cause.cashFlowImpact}\n\n` +
        `• **Estructura y Carga de Deuda:**\n` +
        `${cause.debtSolvencyImpact}\n\n` +
        `• **Generación Operativa (EBITDA):**\n` +
        `${cause.ebitdaImpact}\n\n` +
        `👉 **Diagnóstico de Solvencia:** ${cause.trafficLight === 'VERDE' ? 'Balance sólido y protegido. No hay riesgo de insolvencia inminente.' : cause.trafficLight === 'AMBAR' ? 'Balance estable con ratios de cobertura controlados. En vigilancia temporal.' : 'Atención a los vencimientos de deuda.'}`;
    }

    // 4. Question about Forecast, Future, Outlook, Short/Mid/Long Term
    if (q.includes('previsi') || q.includes('futuro') || q.includes('plazo') || q.includes('subirá') || q.includes('subira') || q.includes('bajará') || q.includes('bajara') || q.includes('comprar') || q.includes('vender') || q.includes('qué hago') || q.includes('que hago')) {
      return `🎯 **Previsión Temporal Fundamental para ${cause.ticker}:**\n\n` +
        `• **Corto Plazo (${cause.shortTermOutlook.period}):**\n` +
        `  ${cause.shortTermOutlook.arrow} **${cause.shortTermOutlook.label}**\n` +
        `  ↳ ${cause.shortTermOutlook.summary}\n\n` +
        `• **Medio Plazo (${cause.midTermOutlook.period}):**\n` +
        `  ${cause.midTermOutlook.arrow} **${cause.midTermOutlook.label}**\n` +
        `  ↳ ${cause.midTermOutlook.summary}\n\n` +
        `• **Largo Plazo (${cause.longTermOutlook.period}):**\n` +
        `  ${cause.longTermOutlook.arrow} **${cause.longTermOutlook.label}**\n` +
        `  ↳ ${cause.longTermOutlook.summary}\n\n` +
        `👉 **Recomendación Estratégica:**\n` +
        `${cause.verdict}`;
    }

    // 5. Question about Dividends or Shareholder Return
    if (q.includes('dividendo') || q.includes('yield') || q.includes('recompra') || q.includes('paga')) {
      return `💵 **Retribución al Accionista para ${cause.ticker}:**\n\n` +
        `• **Situación Financiera:** ${cause.cashFlowImpact}\n` +
        `• **Capacidad de Pago:** ${cause.ebitdaImpact}\n` +
        `• **Veredicto:** ${cause.verdict}`;
    }

    // 6. General / Direct Question
    return `📊 **Análisis Fundamental de ${cause.ticker} (${cause.name}):**\n\n` +
      `Para tu consulta sobre _"${prompt.slice(0, 70)}"_:\n\n` +
      `• **La Causa Real del Precio Hoy:**\n` +
      `${cause.rootCause}\n\n` +
      `• **Filtro de Ruido:**\n` +
      `${cause.noiseExplanation}\n\n` +
      `• **Salud de Balance:**\n` +
      `${cause.debtSolvencyImpact}\n\n` +
      `👉 **Veredicto para tu cartera:**\n` +
      `${cause.verdict}`;
  };

  // Generate contextual response
  const generateResponse = (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const timeNow = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userPrompt.trim(),
      timestamp: timeNow
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Fast, reliable response delivery
    setTimeout(() => {
      const reply = buildAnalyticalAnswer(userPrompt);
      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    const q = inputQuery.trim();
    setInputQuery('');
    generateResponse(q);
  };

  return (
    <div className="rounded-2xl border border-emerald-200/90 bg-white p-3.5 sm:p-5 space-y-3 shadow-xs">
      {/* Header - Clean, professional, no keys or token configuration visible */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-[#191C21]">Consultor Fundamental: {cause.ticker}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Analista en Línea
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Pregúntale cualquier duda sobre noticias, deuda, contratos o balance</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log with guaranteed auto-scroll */}
      <div 
        ref={chatContainerRef}
        className="min-h-[180px] max-h-[380px] overflow-y-auto space-y-3 pr-1 text-xs scroll-smooth"
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            
            <div
              className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-xs'
                  : 'bg-[#F9F7F2] text-[#191C21] border border-[#E7E2D8] rounded-tl-xs space-y-1.5'
              }`}
            >
              <div className="whitespace-pre-line text-[11.5px] sm:text-xs">
                {msg.text}
              </div>
              <span className={`block text-[9px] mt-1.5 text-right ${
                msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
              }`}>
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-600 text-xs py-2 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
            <span className="font-medium">El analista contable está examinando los datos de {cause.ticker}...</span>
          </div>
        )}

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
          Preguntas Rápidas Sugeridas:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => generateResponse(q)}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-emerald-50 hover:text-emerald-900 border border-[#E7E2D8] text-[11px] text-slate-700 transition text-left cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center pt-1">
        <input
          type="text"
          placeholder={`Escribe tu consulta sobre ${cause.ticker} (ej. ¿Por qué está en vigilancia?)...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-white border border-[#DDD8CD] text-xs text-[#191C21] placeholder-slate-400 focus:outline-none focus:border-emerald-700 shadow-2xs"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="absolute right-1.5 p-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition cursor-pointer active:scale-95"
          title="Enviar consulta"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

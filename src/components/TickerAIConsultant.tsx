import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Sparkles, BrainCircuit } from 'lucide-react';
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

  // Auto-scroll to bottom whenever messages or loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  // Preset question shortcuts tailored to the asset
  const suggestedQuestions = [
    `¿Por qué ${cause.ticker} está catalogado en ${cause.trafficLight === 'VERDE' ? 'verde' : cause.trafficLight === 'AMBAR' ? 'vigilancia' : 'alerta'}?`,
    `¿Qué pasa si el estado cambia de verde a amarillo y queda en vigilancia?`,
    `¿Por qué la última noticia de prensa sobre ${cause.ticker} es ruido?`,
    `¿Cómo afecta la situación actual a la caja y a la deuda?`,
    `Explícame la previsión a corto y medio plazo en lenguaje sencillo`
  ];

  // Robust analytical fallback in case network is offline
  const buildOfflineFallback = (userPrompt: string): string => {
    const q = userPrompt.toLowerCase();

    if (q.includes('cambia') || (q.includes('verde') && q.includes('amarillo')) || q.includes('vigilan')) {
      return `🟡 **¿Qué significa que un activo pase de VERDE a AMARILLO (Vigilancia)?**\n\n` +
        `En nuestro sistema de análisis fundamental, el paso de **Verde (Protegido)** a **Amarillo (Vigilancia)** significa que:\n\n` +
        `1. **NO significa peligro de quiebra ni pánico:** El negocio sigue siendo viable y no hay impago de deudas.\n` +
        `2. **Aparece un factor de incertidumbre coyuntural:** Por ejemplo, retraso en la firma de avales bancarios, márgenes de refino comprimidos temporalmente por el precio del petróleo, o una revisión a la baja de previsiones de ventas.\n` +
        `3. **Qué debe hacer el inversor:** No vender por impulso ni entrar en pánico. Se pausa la compra agresiva y se vigilan los hechos relevantes auditados ante la CNMV/SEC hasta que se confirme si el problema se arregla o se agrava.\n\n` +
        `En el caso de **${cause.ticker}**, su estado actual es **${cause.trafficLight}** (${cause.trafficLightReason || cause.rootCause}).`;
    }

    if (q.includes('ruido') || q.includes('prensa') || q.includes('noticia')) {
      return `📰 **Filtro de Ruido para ${cause.ticker}:**\n\n` +
        `• **Lo que dice la prensa:** Foco en titulares alarmistas o movimientos intradía.\n` +
        `• **La realidad contable:** ${cause.noiseExplanation}\n\n` +
        `👉 **Veredicto:** ${cause.verdict}`;
    }

    return `📊 **Análisis Fundamental de ${cause.ticker}:**\n\n` +
      `Para tu consulta sobre _"${userPrompt.slice(0, 60)}"_:\n\n` +
      `• **Situación Real:** ${cause.rootCause}\n` +
      `• **Impacto en Caja & Deuda:** ${cause.cashFlowImpact} | ${cause.debtSolvencyImpact}\n` +
      `• **Recomendación:** ${cause.verdict}`;
  };

  // Generate real AI response via server Gemini endpoint
  const generateResponse = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const timeNow = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // 1. Add user message immediately
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userPrompt.trim(),
      timestamp: timeNow
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Call server-side Gemini API proxy
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userPrompt.trim(),
          ticker: cause.ticker,
          assetContext: {
            name: cause.name,
            price: cause.price,
            change: cause.change,
            trafficLight: cause.trafficLight,
            trafficLightReason: cause.trafficLightReason,
            rootCause: cause.rootCause,
            noiseExplanation: cause.noiseExplanation,
            cashFlowImpact: cause.cashFlowImpact,
            debtSolvencyImpact: cause.debtSolvencyImpact,
            ebitdaImpact: cause.ebitdaImpact,
            shortTermOutlook: cause.shortTermOutlook,
            midTermOutlook: cause.midTermOutlook,
            longTermOutlook: cause.longTermOutlook,
            verdict: cause.verdict
          },
          history: messages.slice(-4)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || buildOfflineFallback(userPrompt);

      setMessages(prev => [
        ...prev,
        {
          id: `asst_${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.warn('Fallback to local analytical engine:', err);
      const fallbackReply = buildOfflineFallback(userPrompt);

      setMessages(prev => [
        ...prev,
        {
          id: `asst_${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
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
      {/* Header - Clean, professional chatbot badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-[#191C21]">Consultor Financiero IA: {cause.ticker}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-emerald-700" />
                <span>Gemini 3.8 Flash Activo</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Pregúntale dudas reales sobre situaciones de mercado, hipótesis o balance</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log with guaranteed auto-scroll */}
      <div 
        ref={chatContainerRef}
        className="min-h-[190px] max-h-[390px] overflow-y-auto space-y-3 pr-1 text-xs scroll-smooth"
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
              className={`p-3.5 rounded-2xl max-w-[92%] sm:max-w-[85%] leading-relaxed shadow-2xs ${
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
          <div className="flex items-center gap-2 text-slate-600 text-xs py-2 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
            <span className="font-medium">Gemini está analizando la situación y razonando tu respuesta...</span>
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
          placeholder={`Escribe tu consulta sobre ${cause.ticker} (ej. ¿Qué pasa si cambia a amarillo?)...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-white border border-[#DDD8CD] text-xs text-[#191C21] placeholder-slate-400 focus:outline-none focus:border-emerald-700 shadow-2xs"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="absolute right-1.5 p-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition cursor-pointer active:scale-95"
          title="Enviar consulta a Gemini"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

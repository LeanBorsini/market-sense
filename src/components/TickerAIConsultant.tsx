import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Sparkles, BrainCircuit, HelpCircle } from 'lucide-react';
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

// Inline formatting parser: Converts **bold**, *italic*, and `code` into real React elements
const parseInlineFormatting = (text: string): React.ReactNode[] => {
  // Regex to match **bold**, *italic*, or `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={i} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="px-1 py-0.5 bg-slate-200/70 rounded text-[11px] font-mono text-emerald-900">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

// Block formatting parser: Converts markdown headings (###), bullets (*, -, •), and dividers (---) into formatted HTML
export const FormattedChatMessage: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <div className="leading-relaxed whitespace-pre-wrap">{content}</div>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`sp_${idx}`} className="h-1.5" />);
      return;
    }

    if (trimmed === '---') {
      elements.push(<hr key={`hr_${idx}`} className="my-2 border-slate-200" />);
      return;
    }

    // Headings (### o ##)
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const headingText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4 key={`h_${idx}`} className="font-bold text-slate-900 text-xs sm:text-[13px] mt-2 mb-1">
          {parseInlineFormatting(headingText)}
        </h4>
      );
      return;
    }

    // Bullet points (* , - , • o listas numeradas)
    const bulletMatch = trimmed.match(/^([*•\-]|(\d+\.))\s+(.*)$/);
    if (bulletMatch) {
      const bulletContent = bulletMatch[3];
      return elements.push(
        <div key={`li_${idx}`} className="flex items-start gap-1.5 pl-1 my-0.5 text-[#191C21]">
          <span className="text-emerald-700 font-bold shrink-0 mt-0.5">•</span>
          <div className="flex-1 leading-relaxed">
            {parseInlineFormatting(bulletContent)}
          </div>
        </div>
      );
    }

    // Paragraph
    elements.push(
      <p key={`p_${idx}`} className="leading-relaxed text-[#191C21] my-0.5">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });

  return <div className="space-y-0.5">{elements}</div>;
};

export const TickerAIConsultant: React.FC<TickerAIConsultantProps> = ({ cause }) => {
  // Direct, clean start: No verbose initial introduction message
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or loading change
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isLoading]);

  // Suggested questions tailored to the asset
  const suggestedQuestions = [
    `¿Por qué ${cause.ticker} está catalogado en ${cause.trafficLight === 'VERDE' ? 'verde' : cause.trafficLight === 'AMBAR' ? 'vigilancia' : 'alerta'}?`,
    `¿Qué pasa si el estado cambia de verde a amarillo y queda en vigilancia?`,
    `¿La última noticia de prensa sobre ${cause.ticker} es ruido?`,
    `¿Cómo afecta la situación actual a la caja y a la deuda?`,
    `Explícame la previsión a medio plazo en lenguaje sencillo`
  ];

  // Direct, non-technical fallback in case of offline/network issues
  const buildOfflineFallback = (userPrompt: string): string => {
    const q = userPrompt.toLowerCase();

    if (q.includes('cambia') || (q.includes('verde') && q.includes('amarillo')) || q.includes('vigilan')) {
      return `🟡 **¿Qué significa pasar de Verde a Amarillo (Vigilancia)?**\n\n` +
        `• **No es peligro de quiebra:** El negocio sigue funcionando y no hay impago de deudas.\n` +
        `• **Hay incertidumbre temporal:** Aparece una duda sobre plazos, márgenes o firma de contratos.\n` +
        `• **Qué hacer con tu dinero:** No comprar por impulso ni vender con pánico; esperar a que se confirmen los hechos auditados ante el regulador.\n\n` +
        `En el caso de **${cause.ticker}**, su estado actual es **${cause.trafficLight}** (${cause.trafficLightReason || cause.rootCause}).`;
    }

    if (q.includes('ruido') || q.includes('prensa') || q.includes('noticia')) {
      return `📰 **Filtro de Ruido para ${cause.ticker}:**\n\n` +
        `Los titulares de prensa suelen alarmar para ganar visitas. En ${cause.ticker}, la realidad contable es:\n\n` +
        `• ${cause.noiseExplanation}\n\n` +
        `👉 **Veredicto:** ${cause.verdict}`;
    }

    return `📊 **Resumen directo para ${cause.ticker}:**\n\n` +
      `• **Situación real:** ${cause.rootCause}\n` +
      `• **Caja y Deuda:** ${cause.cashFlowImpact} | ${cause.debtSolvencyImpact}\n` +
      `• **Veredicto:** ${cause.verdict}`;
  };

  // Generate real AI response via server Gemini endpoint
  const generateResponse = async (userPrompt: string) => {
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

    try {
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
      console.warn('Usando respuesta analítica directa:', err);
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
      {/* Header - Simple, clean and direct */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-[#191C21]">Consultor Financiero: {cause.ticker}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-emerald-700" />
                <span>En Línea</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Haz cualquier pregunta sobre balance, noticias, deuda o situaciones de mercado</p>
          </div>
        </div>
      </div>

      {/* When no messages yet: Compact direct quick start */}
      {messages.length === 0 && !isLoading && (
        <div className="py-2 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Preguntas rápidas sobre {cause.ticker}:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => generateResponse(q)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-emerald-50 hover:text-emerald-900 border border-[#E7E2D8] text-[11.5px] text-slate-700 transition text-left cursor-pointer active:scale-98"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Log with guaranteed auto-scroll and proper Markdown rendering */}
      {(messages.length > 0 || isLoading) && (
        <div 
          ref={chatContainerRef}
          className="min-h-[140px] max-h-[380px] overflow-y-auto space-y-3 pr-1 text-xs scroll-smooth"
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
                    : 'bg-[#F9F7F2] text-[#191C21] border border-[#E7E2D8] rounded-tl-xs'
                }`}
              >
                <div className="text-[11.5px] sm:text-xs">
                  <FormattedChatMessage content={msg.text} isUser={msg.sender === 'user'} />
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
              <span className="font-medium">Analizando la situación y preparando respuesta clara...</span>
            </div>
          )}

          {/* Scroll Anchor */}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Suggested Quick Questions (when in conversation) */}
      {messages.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.slice(0, 3).map((q, idx) => (
              <button
                key={idx}
                onClick={() => generateResponse(q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-emerald-50 hover:text-emerald-900 border border-[#E7E2D8] text-[10.5px] text-slate-600 transition text-left cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center pt-1">
        <input
          type="text"
          placeholder={`Escribe tu consulta sobre ${cause.ticker}...`}
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

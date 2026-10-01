import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Key, CheckCircle, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
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

export const TickerAIConsultant: React.FC<TickerAIConsultantProps> = ({ cause, onClose }) => {
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
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('marketsense_gemini_api_key') || '';
  });
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [savedKeyNotice, setSavedKeyNotice] = useState(false);

  // Preset question shortcuts
  const suggestedQuestions = [
    `¿Por qué la última noticia de prensa sobre ${cause.ticker} es ruido?`,
    `¿Cómo afecta la situación actual a la caja y a la deuda?`,
    `¿Qué riesgos reales debo vigilar en su balance?`,
    `Explícame la previsión a corto y medio plazo en lenguaje sencillo`
  ];

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key.trim());
    localStorage.setItem('marketsense_gemini_api_key', key.trim());
    setSavedKeyNotice(true);
    setTimeout(() => {
      setSavedKeyNotice(false);
      setShowKeyConfig(false);
    }, 1500);
  };

  // Generate contextual response
  const generateResponse = async (userPrompt: string) => {
    const timeNow = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userPrompt,
      timestamp: timeNow
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // If user has configured their free Gemini API Key, use real-time Gemini 3.8 Flash model
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const systemPrompt = `Eres un auditor financiero sénior y asesor racional para inversores sensatos.
Estás analizando el activo: ${cause.ticker} - ${cause.name}.
Cotización actual: ${cause.price} (${cause.change}).
Causa real del movimiento: ${cause.rootCause}.
Filtro de ruido: ${cause.noiseExplanation}.
Salud contable:
- Flujo de caja: ${cause.cashFlowImpact}
- Deuda y solvencia: ${cause.debtSolvencyImpact}
- EBITDA: ${cause.ebitdaImpact}
- Previsión Corto Plazo: ${cause.shortTermOutlook.label} (${cause.shortTermOutlook.summary})
- Previsión Medio Plazo: ${cause.midTermOutlook.label} (${cause.midTermOutlook.summary})
- Previsión Largo Plazo: ${cause.longTermOutlook.label} (${cause.longTermOutlook.summary})
- Veredicto ejecutivo: ${cause.verdict}

Instrucciones:
1. Responde de forma concisa, transparente y sin jerga técnica incomprensible (en cristiano).
2. Separa siempre el RUIDO de la PRENSA frente a los HECHOS CONTABLES.
3. Explica con claridad cómo afecta a la caja del negocio y al dinero del inversor.
4. Si el usuario pregunta por una noticia o rumor, clasifícala honestamente como Ruido o Riesgo Real.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt
          }
        });

        const replyText = response.text || 'No se pudo generar respuesta.';
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
        return;
      } catch (err: any) {
        console.error('Gemini API Error:', err);
        // Fallback to internal fundamental reasoning
      }
    }

    // Built-in intelligent reasoning engine (works 100% free offline without API key)
    setTimeout(() => {
      let reply = '';
      const q = userPrompt.toLowerCase();

      if (q.includes('ruido') || q.includes('prensa') || q.includes('noticia') || q.includes('titular')) {
        reply = `**Análisis del ruido mediático sobre ${cause.ticker}:**\n\n` +
          `La prensa generalista suele exagerar titulares para generar clics o por la volatilidad intradía. En el caso de ${cause.name}:\n` +
          `• **La realidad:** ${cause.rootCause}\n` +
          `• **El filtro de ruido:** ${cause.noiseExplanation}\n\n` +
          `**Conclusión:** Salvo que veas cancelaciones formales de contratos o impago de intereses en la CNMV/SEC, las noticias de prensa son mero ruido que no destruye el valor contable.`;
      } else if (q.includes('caja') || q.includes('deuda') || q.includes('ebitda') || q.includes('quiebra') || q.includes('solvencia')) {
        reply = `**Radiografía de Balance y Solvencia de ${cause.ticker}:**\n\n` +
          `• **Flujo de Caja Libre:** ${cause.cashFlowImpact}\n` +
          `• **Estructura de Deuda:** ${cause.debtSolvencyImpact}\n` +
          `• **Capacidad de Generación (EBITDA):** ${cause.ebitdaImpact}\n\n` +
          `**Veredicto de solvencia:** ${cause.trafficLight === 'VERDE' ? 'Balance protegido. No hay riesgo de insolvencia inminente.' : 'En vigilancia de reestructuración.'}`;
      } else if (q.includes('previsi') || q.includes('futuro') || q.includes('al alza') || q.includes('baja') || q.includes('comprar')) {
        reply = `**Previsión Temporal para ${cause.ticker}:**\n\n` +
          `• **Corto Plazo (1-3 meses):** ${cause.shortTermOutlook.arrow} **${cause.shortTermOutlook.label}** · ${cause.shortTermOutlook.summary}\n` +
          `• **Medio Plazo (6-12 meses):** ${cause.midTermOutlook.arrow} **${cause.midTermOutlook.label}** · ${cause.midTermOutlook.summary}\n` +
          `• **Largo Plazo (1-3+ años):** ${cause.longTermOutlook.arrow} **${cause.longTermOutlook.label}** · ${cause.longTermOutlook.summary}\n\n` +
          `**Recomendación estratégica:** ${cause.verdict}`;
      } else {
        reply = `**Diagnóstico para ${cause.ticker} sobre tu consulta:**\n\n` +
          `Para evaluar esta duda, lo esencial es contrastar si afecta a los ingresos reales o solo al precio de la acción hoy.\n\n` +
          `• **Situación actual:** ${cause.rootCause}\n` +
          `• **Generación de caja:** ${cause.cashFlowImpact}\n` +
          `• **Recomendación:** ${cause.verdict}\n\n` +
          `*(Consejo: Puedes añadir tu clave gratuita de Google Gemini en la ruedita superior si deseas análisis en tiempo real de cualquier noticia específica).*`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsLoading(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    const q = inputQuery.trim();
    setInputQuery('');
    generateResponse(q);
  };

  return (
    <div className="rounded-xl border border-emerald-300 bg-white p-4 space-y-3.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#191C21]">Consultor IA: {cause.ticker}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                {geminiApiKey ? 'Gemini 3.8 Flash' : 'Motor Fundamental'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Pregúntale cualquier duda sobre noticias, deuda o ruido</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs flex items-center gap-1 transition"
            title="Configurar Clave Gratuita de Google Gemini (0€/mes)"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">{geminiApiKey ? 'API Conectada' : 'Activar Gemini'}</span>
          </button>
        </div>
      </div>

      {/* API Key Drawer (Optional for Free Unlimited Live Gemini 3.8 Flash) */}
      {showKeyConfig && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <strong className="text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Capa Gratuita de Google Gemini (0 €/mes)
            </strong>
            <span className="text-[10px] text-amber-700 font-semibold">1.500 consultas gratis/día</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Puedes sacar tu clave gratuita en 10 segundos en <strong>aistudio.google.com</strong>. Se guarda solo en tu móvil/navegador. Si la dejas vacía, la app responderá usando el motor contable integrado.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="Pega tu API Key de Gemini (AIzaSy...)"
              defaultValue={geminiApiKey}
              id="gemini-key-input"
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-mono focus:outline-none focus:border-emerald-600"
            />
            <button
              onClick={() => {
                const el = document.getElementById('gemini-key-input') as HTMLInputElement;
                if (el) handleSaveApiKey(el.value);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition"
            >
              {savedKeyNotice ? '¡Guardada!' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-xs'
                  : 'bg-[#F9F7F2] text-[#191C21] border border-[#E7E2D8] rounded-tl-xs space-y-1'
              }`}
            >
              <div className="whitespace-pre-line text-[11px] sm:text-xs">
                {msg.text}
              </div>
              <span className={`block text-[9px] mt-1 text-right ${
                msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
              }`}>
                {msg.timestamp}
              </span>
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
            <span>Analizando balance y noticias para {cause.ticker}...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-1 pt-1 border-t border-slate-100">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
          Preguntas Rápidas:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => generateResponse(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-emerald-50 hover:text-emerald-900 border border-[#E7E2D8] text-[11px] text-slate-600 transition text-left"
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
          placeholder={`Escribe tu duda sobre ${cause.ticker} (ej. ¿Qué pasa con los avales?)...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="w-full pl-3 pr-10 py-2 rounded-xl bg-white border border-[#DDD8CD] text-xs text-[#191C21] placeholder-slate-400 focus:outline-none focus:border-emerald-700 shadow-2xs"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

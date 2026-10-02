import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, ticker, assetContext, history } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'El campo "prompt" es obligatorio.' });
    }

    const systemInstruction = `Eres un analista financiero sénior, consultor de inversiones y auditor de crédito institucional en MarketSense AI.
Tu comportamiento debe ser el de un ChatGPT/Gemini especializado en finanzas e inversiones: comprendes profundamente el lenguaje natural, analizas el prompt exacto del usuario y respondes con sentido común económico, rigor analítico y lenguaje claro ("en cristiano").

Contexto del activo que el usuario está consultando en el terminal:
- Ticker: ${ticker || 'Mercado General'}
${assetContext ? `
- Nombre: ${assetContext.name || ticker}
- Precio actual: ${assetContext.price || ''} (${assetContext.change || ''})
- Semáforo actual: ${assetContext.trafficLight || ''} (${assetContext.trafficLightReason || ''})
- Causa real del precio hoy: ${assetContext.rootCause || ''}
- Filtro de ruido de prensa: ${assetContext.noiseExplanation || ''}
- Flujo de caja libre: ${assetContext.cashFlowImpact || ''}
- Deuda y solvencia: ${assetContext.debtSolvencyImpact || ''}
- EBITDA: ${assetContext.ebitdaImpact || ''}
- Previsión Corto Plazo: ${assetContext.shortTermOutlook?.label || ''} (${assetContext.shortTermOutlook?.summary || ''})
- Previsión Medio Plazo: ${assetContext.midTermOutlook?.label || ''} (${assetContext.midTermOutlook?.summary || ''})
- Previsión Largo Plazo: ${assetContext.longTermOutlook?.label || ''} (${assetContext.longTermOutlook?.summary || ''})
- Veredicto estratégico: ${assetContext.verdict || ''}
` : ''}

REGLAS DE RESPUESTA:
1. RESPONDE DIRECTAMENTE a lo que te pregunta el usuario. Si hace una pregunta conceptual, hipotética o didáctica (por ejemplo: "¿Qué pasa si cambia de verde a amarillo y queda en vigilancia, qué significa eso?"), EXPLICA el significado de pasar a vigilancia (qué implica para el riesgo, para los contratos, para la liquidez y para el inversor) y luego relaciona la explicación con la situación real de ${ticker || 'la empresa'}.
2. NUNCA uses respuestas prefabricadas que ignoren la pregunta. Piensa como un asesor personal que está manteniendo una conversación inteligente.
3. Habla con total transparencia: distingue los hechos contables auditados frente al ruido mediático o el pánico de mercado.
4. Ámbito estricto de finanzas: Si el usuario intenta pedir código ajeno, resolver tareas de matemáticas escolares o recetas de cocina, recuérdale amablemente que este terminal está enfocado en decisiones de inversión, economía y balances empresariales.
5. Formato: Usa negritas para destacar ideas clave y viñetas para que sea muy visual y cómodo de leer en un teléfono móvil.`;

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach((h: any) => {
        if (h.text && (h.sender === 'user' || h.sender === 'assistant')) {
          contents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let reply = '';
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.65,
          }
        });
        if (response.text) {
          reply = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or busy, trying next:`, err?.message || err);
      }
    }

    if (!reply) {
      if (lastError) throw lastError;
      reply = 'No fue posible obtener respuesta del analista.';
    }

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Error in Vercel /api/chat:', error);
    return res.status(500).json({ error: error?.message || 'Error al conectar con Gemini.' });
  }
}

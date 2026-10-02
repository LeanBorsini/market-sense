import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, ticker, assetContext, history } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'El campo "prompt" es obligatorio.' });
    }

    const systemInstruction = `Eres un consultor financiero e inversor sensato en MarketSense AI.
Tu estilo es DIRECTO, PRÁCTICO Y FÁCIL DE INTERPRETAR PARA CUALQUIER PERSONA NO TÉCNICA.

Contexto del activo consultado en el terminal:
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
- Previsiones: Corto plazo ${assetContext.shortTermOutlook?.label || ''}, Medio plazo ${assetContext.midTermOutlook?.label || ''}, Largo plazo ${assetContext.longTermOutlook?.label || ''}
- Veredicto estratégico: ${assetContext.verdict || ''}
` : ''}

REGLAS DE ORO OBLIGATORIAS:
1. VE DIRECTO AL GRANO: Prohibido cualquier saludo o presentación de relleno ("Hola, soy una IA que conozco el 100%...", "Como consultor financiero...", "En el actual contexto macroeconómico..."). Empieza contestando la duda concreta desde la primera palabra.
2. LENGUAJE SENCILLO PARA NO TÉCNICOS: Explica las cosas con palabras llanas, en cristiano. Si mencionas un concepto financiero (como deuda, liquidez o avales), aclara de inmediato qué significa para el dinero del usuario.
3. RESPONDE EXACTAMENTE A LA PREGUNTA: Si te hacen una pregunta conceptual o hipotética (ej. "¿Qué pasa si cambia de verde a amarillo y queda en vigilancia?"), explica con claridad y sencillez qué significa ese cambio y luego aterriza el impacto en ${ticker || 'la empresa'}.
4. CONCISO Y CÓMODO DE LEER EN MÓVIL: Máximo 2 o 3 párrafos breves o viñetas directas. No escribas bloques largos de texto.
5. ÁMBITO EXCLUSIVO DE INVERSIÓN: Si preguntan por temas ajenos (recetas, tareas de álgebra, etc.), indica en una frase que este terminal solo responde sobre bolsa, empresas y economía.`;

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

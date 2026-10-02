import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client with User-Agent as required by AI Studio guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// Financial Chatbot endpoint powered by Gemini 3.8 Flash
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, ticker, assetContext, history } = req.body;
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

    // Build chat contents from history if provided
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

    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ 
      error: error?.message || 'Error al conectar con el motor de análisis Gemini.' 
    });
  }
});

// Health check endpoint
// Telegram Dispatch Proxy to bypass browser CORS and provide detailed diagnostics
app.post('/api/telegram-dispatch', async (req, res) => {
  try {
    const { token, chatId, text } = req.body;
    if (!token || !chatId || !text) {
      return res.status(400).json({ error: 'Faltan parámetros: token, chatId y text son obligatorios.' });
    }

    const tgUrl = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
    const response = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: text,
        disable_web_page_preview: true
      })
    });

    const data: any = await response.json();
    if (!data.ok) {
      let friendlyError = data.description || 'Error devuelto por la API de Telegram';
      if (friendlyError.includes('chat not found')) {
        friendlyError = `Chat no encontrado. En grupos privados ("${chatId}") Telegram no acepta el nombre escrito; requiere su Chat ID numérico (ej. -100...). Entra en ajustes ⚙️ y pulsa "Detectar ID de mi Grupo".`;
      } else if (friendlyError.includes('Unauthorized') || friendlyError.includes('Not Found')) {
        friendlyError = 'Bot Token incorrecto o revocado. Revisa el token entregado por @BotFather.';
      } else if (friendlyError.includes('bot is not a member') || friendlyError.includes('not enough rights')) {
        friendlyError = 'El bot no es administrador del grupo o canal. Entra a tu grupo en Telegram, añade tu bot como Administrador con permisos para publicar mensajes.';
      }
      return res.status(400).json({ error: friendlyError, raw: data });
    }

    return res.status(200).json({ success: true, result: data.result });
  } catch (err: any) {
    console.error('Error in /api/telegram-dispatch:', err);
    return res.status(500).json({ error: `Error de conexión con Telegram: ${err?.message || err}` });
  }
});

// Telegram Auto-detect Chat ID proxy
app.post('/api/telegram-detect', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'El Bot Token es obligatorio.' });
    }

    const response = await fetch(`https://api.telegram.org/bot${token.trim()}/getUpdates`);
    const data: any = await response.json();

    if (!data.ok) {
      return res.status(400).json({ error: data.description || 'Token inválido' });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: `Error al conectar con Telegram: ${err?.message || err}` });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MarketSense AI Full-Stack Server' });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');

  if (isProd && fs.existsSync(distPath)) {
    // Production: serve built static files
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development: mount Vite middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`MarketSense AI Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, chatId, text } = req.body || {};
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
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body || {};
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
}

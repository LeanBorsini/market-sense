import { cloudBotState } from '../../server-cloud-bot';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    cloudBotState.isRunning = !cloudBotState.isRunning;
    return res.status(200).json({
      success: true,
      isRunning: cloudBotState.isRunning,
      state: cloudBotState,
      message: cloudBotState.isRunning ? 'Bot en la nube activo y operando 24/7' : 'Bot en la nube pausado'
    });
  } catch (err: any) {
    console.error('Error in /api/cloud-bot/toggle:', err);
    return res.status(500).json({
      error: err?.message || 'Error al cambiar estado del bot'
    });
  }
}

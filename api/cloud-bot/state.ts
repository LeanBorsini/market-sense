import { cloudBotState } from '../../server-cloud-bot';

export default async function handler(req: any, res: any) {
  try {
    return res.status(200).json({
      success: true,
      data: cloudBotState,
      state: cloudBotState
    });
  } catch (err: any) {
    console.error('Error in /api/cloud-bot/state:', err);
    return res.status(500).json({
      error: err?.message || 'Error al obtener estado del bot'
    });
  }
}

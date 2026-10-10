import { cloudBotState, syncStateWithActiveAccount } from '../../../server-cloud-bot';
import { TradingAccount } from '../../../src/types/cloudBot';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.body || {};
    if (!accountId) {
      return res.status(400).json({ error: 'accountId es obligatorio' });
    }

    const found = cloudBotState.accounts.find((a: TradingAccount) => a.id === accountId);
    if (!found) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    syncStateWithActiveAccount(accountId);

    return res.status(200).json({
      success: true,
      message: `Cuenta activa cambiada a ${found.name} (#${found.accountNumber})`,
      account: found,
      state: cloudBotState
    });
  } catch (err: any) {
    console.error('Error switching account:', err);
    return res.status(500).json({ error: err?.message || 'Error al cambiar cuenta activa' });
  }
}

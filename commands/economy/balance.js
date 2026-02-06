import { getUser } from '../../utils/economy.js';
import { getUserJid, getDisplayName } from '../../utils/player.js';

export default {
  name: 'balance',
  description: 'View your balance',

  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);
    const pushName = getDisplayName(msg);

    const player = await getUser(jid, pushName);

    if (!player) return;

    await sock.sendMessage(from, {
      text:
`💼 *Your Balance*

👛 Wallet: ${player.gold}
🏦 Bank: ${player.bank}
🏅 Rank: ${player.rank}`
    });
  }
};

import { getPlayerDragons } from '../../utils/dragons.js';
import { getUserJid } from '../../utils/player.js';

export default {
  name: 'dragons',
  description: 'List your dragons',

  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);

    const dragons = await getPlayerDragons(jid);

    if (dragons.length === 0) {
      return sock.sendMessage(from, { text: '🐉 You don\'t have any dragons yet. Use %startdragon to get your first one!' });
    }

    let list = '📜 *Your Dragons*\n\n';
    dragons.forEach((d, i) => {
      list += `${i + 1}. *${d.name}* (ID: \`${d.id}\`)\n   Type: ${d.type} | Lvl: ${d.level} | Rarity: ${d.rarity}\n\n`;
    });

    await sock.sendMessage(from, { text: list });
  }
};

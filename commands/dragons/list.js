import { getPlayerDragons } from '../../utils/dragons.js';
import { getUserJid } from '../../utils/player.js';

export default {
  name: 'dragons',
  description: 'List your dragons',

  execute: async ({ sender, reply, getPlayer }) => {
    const player = getPlayer(sender);
    const dragons = player.dragons || [];

    if (dragons.length === 0) {
      return reply('🐉 You don\'t have any dragons yet. Use %startdragon to get your first one!');
    }

    let list = '📜 *Your Dragons*\n\n';
    dragons.forEach((d, i) => {
      list += `${i + 1}. *${d.name}* (ID: \`${d.id}\`)\n   Type: ${d.type} | Lvl: ${d.level} | Rarity: ${d.rarity}\n\n`;
    });

    reply(list);
  }
};

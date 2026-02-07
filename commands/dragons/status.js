import DB from '../../utils/database.js';

export default {
  name: 'status',
  description: 'Show your current dragons status',
  execute: async ({ sender, reply, getPlayer }) => {
    const player = getPlayer(sender);
    if (!player.dragons?.length) return reply('❌ You have no dragons.');

    let text = `📊 *${player.name} — Dragon Status*\n\n`;

    player.dragons.forEach((d, i) => {
      text += `${i + 1}. *${d.name}* (Lv ${d.level || 1})\n   ❤️ HP: ${d.hp}/${d.maxHp || 50} | 🔮 PP: ${d.pp}/${d.maxPp || 20}\n\n`;
    });

    reply(text);
  }
};

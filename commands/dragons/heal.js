import DB from '../../utils/database.js';

export default {
  name: 'heal',
  description: 'Heal your dragon if not in a battle',
  execute: async ({ sender, reply, getPlayer }) => {
    const db = await DB.getDB('users');
    const player = getPlayer(sender);

    if (db.sessions?.[sender]?.inBattle) {
      return reply('❌ You cannot heal during a battle.');
    }

    if (!player.dragons?.length) return reply('❌ No dragons to heal.');

    player.dragons.forEach(d => {
      d.hp = d.maxHp || 100;
      d.pp = d.maxPp || 100;
    });

    await DB.saveDB('users');
    reply('💚 All dragons fully healed.');
  }
};

import DB from '../../utils/database.js';
import { RANKS } from '../../utils/ranks.js';

export default {
  name: 'daily',
  description: 'Claim your daily currency reward based on your rank',
  execute: async ({ sender, reply, getPlayer }) => {
    const user = getPlayer(sender);

    const now = Date.now();
    user.lastDaily = user.lastDaily || 0;

    if (now - user.lastDaily < 24 * 60 * 60 * 1000) {
      const remaining = 24 * 60 * 60 * 1000 - (now - user.lastDaily);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      return reply(`⏳ You already claimed your daily. Come back in ${hours}h ${minutes}m.`);
    }

    // Determine reward from rank
    const rankName = user.rank || RANKS[0].name;
    const rankData = RANKS.find(r => r.name === rankName) || RANKS[0];

    user.gold = (user.gold || 0) + rankData.daily;
    user.lastDaily = now;

    await DB.saveDB('users');

    reply(`💰 You claimed your daily reward of ${rankData.daily} coins for rank ${rankName}!\n💵 Wallet: ${user.gold}`);
  }
};

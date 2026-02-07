import DB from '../../utils/database.js';
import { getUserJid } from '../../utils/player.js';
import { getUser } from '../../utils/economy.js';

export default {
  name: 'dragon',
  description: 'Show detailed stats of a dragon',
  execute: async ({ sender, args, reply, getPlayer, sock, from }) => {
    const player = getPlayer(sender);
    const dragons = player.dragons || [];

    let dragon;
    if (!args[0]) {
      dragon = dragons[0];
    } else {
      const idx = parseInt(args[0]) - 1;
      if (!isNaN(idx) && dragons[idx]) {
        dragon = dragons[idx];
      } else {
        dragon = dragons.find(d => d.name.toLowerCase().includes(args.join(' ').toLowerCase()));
      }
    }

    if (!dragon) {
      return reply('❌ Dragon not found in your collection.');
    }

    const xpNeeded = 100 + (dragon.level || 1) * 50;
    const xpPercent = Math.min(100, Math.floor(((dragon.exp || 0) / xpNeeded) * 100));

    let movesText = 'None';
    if (dragon.moves && dragon.moves.length > 0) {
        movesText = dragon.moves.map(m => `• ${m.name} (${m.type || dragon.type}, Pwr: ${m.power}, Cost: ${m.cost})`).join('\n');
    }

    const statsMsg = `
🧣 *${dragon.name}* (Level ${dragon.level || 1})
🆔 ID: \`${dragon.id}\`
🧬 Species: ${dragon.species || 'Unknown'}

⭐ XP: ${dragon.exp || 0}/${xpNeeded} (${xpPercent}%)
💖 HP: ${dragon.hp}/${dragon.maxHp || 50}
🔮 PP: ${dragon.pp}/${dragon.maxPp || 20}

🔥 Rarity: ${dragon.rarity}
元素 Element: ${dragon.type || dragon.element}

⚔️ Attack: ${dragon.atk || 10}
🛡️ Defense: ${dragon.def || 5}

📜 *Moves:*
${movesText}
    `;

    if (dragon.image) {
        await sock.sendMessage(from, { image: { url: dragon.image }, caption: statsMsg });
    } else {
        reply(statsMsg);
    }
  }
};

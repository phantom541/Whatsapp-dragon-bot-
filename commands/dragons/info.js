import DB from '../../utils/database.js';
import { getUserJid } from '../../utils/player.js';
import { getUser } from '../../utils/economy.js';

export default {
  name: 'dragon',
  description: 'Show detailed stats of a dragon',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);
    const user = await getUser(jid);

    let dragonId = args[0];
    if (!dragonId) {
        // Fallback to companion (first dragon)
        if (user.dragons && user.dragons.length > 0) {
            dragonId = user.dragons[0];
        } else {
            return sock.sendMessage(from, { text: '❌ You don\'t have any dragons. Use %startdragon to get one!' });
        }
    }

    const dragDb = await DB.getDB('dragons');
    const dragon = dragDb.dragons?.[dragonId];

    if (!dragon) {
      return sock.sendMessage(from, { text: '❌ Dragon not found.' });
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

Owner: ${dragon.owner === jid ? 'You' : dragon.owner}
    `;

    if (dragon.image) {
        await sock.sendMessage(from, { image: { url: dragon.image }, caption: statsMsg });
    } else {
        await sock.sendMessage(from, { text: statsMsg });
    }
  }
};

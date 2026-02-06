import { fightDragons } from '../../utils/battle.js';
import { getUserJid } from '../../utils/player.js';
import DB from '../../utils/database.js';
import { getUser } from '../../utils/economy.js';

const BATTLE_COOLDOWN = 60 * 1000; // 1 minute

export default {
  name: 'battle',
  description: 'Challenge another player to a dragon battle',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const player1Id = getUserJid(msg);

    if (!args[0]) {
      return sock.sendMessage(from, { text: '❌ Usage: %battle <targetUserNumber>\nExample: %battle 1234567890' });
    }

    const targetNumber = args[0].replace(/[^0-9]/g, '');
    const player2Id = `${targetNumber}@s.whatsapp.net`;

    if (player1Id === player2Id) {
        return sock.sendMessage(from, { text: '❌ You cannot battle yourself!' });
    }

    const player1 = await getUser(player1Id);
    const player2 = await getUser(player2Id);

    if (!player2.name || player2.name === 'Unknown') {
        return sock.sendMessage(from, { text: '❌ Target player not found or hasn\'t registered yet.' });
    }

    // Check cooldown
    const now = Date.now();
    if (now - (player1.inBattle?.lastBattle || 0) < BATTLE_COOLDOWN) {
        const remaining = Math.ceil((BATTLE_COOLDOWN - (now - player1.inBattle.lastBattle)) / 1000);
        return sock.sendMessage(from, { text: `⚠️ You are still recovering! Wait ${remaining}s.` });
    }

    // Check if dragons are set (companion is the first dragon in the list if not explicitly set)
    // Actually the user snippet uses 'companion' property which is a dragon object.
    // In my implementation, dragons are stored in db.dragons and referenced by ID in user.dragons.
    // Let's adapt: if no companion, use the first dragon in user.dragons.
    const dragons1 = player1.dragons || [];
    const dragons2 = player2.dragons || [];

    if (dragons1.length === 0) return sock.sendMessage(from, { text: '❌ You have no dragons to battle with!' });
    if (dragons2.length === 0) return sock.sendMessage(from, { text: '❌ Target player has no dragons!' });

    const dragon1Id = dragons1[0];
    const dragon2Id = dragons2[0];

    // Set battle state
    player1.inBattle.active = true;
    player2.inBattle.active = true;
    player1.inBattle.lastBattle = now;
    player2.inBattle.lastBattle = now;
    await DB.saveDB('users');

    const result = await fightDragons(player1Id, dragon1Id, player2Id, dragon2Id);

    // Reset battle state
    player1.inBattle.active = false;
    player2.inBattle.active = false;
    await DB.saveDB('users');

    if (!result.ok) {
      return sock.sendMessage(from, { text: `❌ Error: ${result.reason}` });
    }

    const logText = result.log.join('\n');
    const message = `⚔️ *Battle Result* ⚔️

🏆 *Winner:* ${result.winner.name} (${result.winner.owner === player1Id ? player1.name : player2.name})
💔 *Loser:* ${result.loser.name} (${result.loser.owner === player1Id ? player1.name : player2.name})
${result.rankUpMsg}

🧣 *${result.winner.name}* HP: ${result.winner.hp}/${result.winner.maxHp}
🧣 *${result.loser.name}* HP: ${result.loser.hp}/${result.loser.maxHp}

*Battle log:*
${logText}`;

    await sock.sendMessage(from, { text: message });
  }
};

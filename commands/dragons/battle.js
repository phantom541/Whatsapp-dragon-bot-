import { fightDragons } from '../../utils/battle.js';
import { getUserJid } from '../../utils/player.js';

export default {
  name: 'battle',
  description: 'Fight another player\'s dragon',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const player1Id = getUserJid(msg);
    const dragon1Id = args[0];
    const dragon2Id = args[1];

    if (!dragon1Id || !dragon2Id) {
      return sock.sendMessage(from, {
        text: '❌ Usage: %battle <yourDragonId> <opponentDragonId>\nUse %dragons to see your dragon IDs.'
      });
    }

    const result = await fightDragons(player1Id, dragon1Id, null, dragon2Id);

    if (!result.ok) {
      return sock.sendMessage(from, { text: `❌ Error: ${result.reason}` });
    }

    const logText = result.log.join('\n');
    const message = `🏆 *Battle Result!*

🎊 *Winner:* ${result.winner.name}
💀 *Loser:* ${result.loser.name}
${result.rankUpMsg}

*Battle log:*
${logText}`;

    await sock.sendMessage(from, { text: message });
  }
};

import { getUser, claimDaily } from '../../utils/economy.js';
import { getUserJid, getDisplayName } from '../../utils/player.js';

export default {
  name: 'daily',
  description: 'Claim your daily reward',

  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);
    const pushName = getDisplayName(msg);

    const user = await getUser(jid, pushName);
    const reward = await claimDaily(jid);

    if (!reward) {
      return sock.sendMessage(from, {
        text: '⏳ You already claimed your daily reward. Come back in 24 hours.'
      });
    }

    await sock.sendMessage(from, {
      text: `💰 Daily Reward Claimed!

🏮 Rank: ${user.rank}
🪙 Gold Received: ${reward}

Your grind continues.`
    });
  }
};

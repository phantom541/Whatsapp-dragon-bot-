import { getActiveSpawn, claimSpawn, removeSpawn } from '../../system/spawner.js';
import { getUser } from '../../utils/economy.js';
import { getUserJid, getDisplayName } from '../../utils/player.js';
import { createDragon } from '../../utils/dragons.js';
import { getRankIndex } from '../../utils/ranks.js';
import DB from '../../utils/database.js';

export default {
  name: 'capture',
  description: 'Capture a spawned dragon',

  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);
    const pushName = getDisplayName(msg);

    const spawn = getActiveSpawn(from);
    if (!spawn) {
      return sock.sendMessage(from, { text: '❌ No dragon to capture here.' });
    }

    if (spawn.claimedBy) {
        return sock.sendMessage(from, { text: '❌ Someone already engaged this dragon.' });
    }

    const user = await getUser(jid, pushName);

    // Calculate rank-based delay
    const rankIndex = getRankIndex(user.rank);
    const delay = Math.max(0, 10 - rankIndex) * 1000;
    const timeSinceSpawn = Date.now() - spawn.spawnedAt;

    if (timeSinceSpawn < delay) {
      const remaining = Math.ceil((delay - timeSinceSpawn) / 1000);
      return sock.sendMessage(from, { text: `⏳ Your rank is too low to react this fast! Wait ${remaining}s.` });
    }

    const success = claimSpawn(from, jid);
    if (!success) {
      return sock.sendMessage(from, { text: '❌ Someone already engaged this dragon.' });
    }

    // Battle logic (instant capture for now as per Step 10)
    // In future steps this will be more complex
    const dragon = await createDragon(spawn.dragonTemplate, jid);

    user.dragons = user.dragons || [];
    user.dragons.push(dragon.id);
    await DB.saveDB('users');

    removeSpawn(from);

    await sock.sendMessage(from, {
      text: `⚔️ *Capture Successful!*

You successfully captured the ${spawn.rarity} dragon: *${dragon.name}*!
It has been added to your party.`
    });
  }
};

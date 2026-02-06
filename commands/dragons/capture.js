import { getActiveSpawn, claimSpawn, removeSpawn } from '../../system/spawner.js';
import { getUser, addXP } from '../../utils/economy.js';
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

    // Reward XP based on rarity
    const rarityXP = {
      Common: 50,
      Uncommon: 100,
      Rare: 200,
      Epic: 350,
      Legendary: 500,
      Mythic: 1000
    };
    const gainedXP = rarityXP[spawn.rarity] || 50;
    const xpResult = await addXP(jid, gainedXP);

    // Battle logic (instant capture for now as per Step 10/11)
    const dragon = await createDragon(spawn.dragonTemplate, jid);

    user.dragons = user.dragons || [];
    user.dragons.push(dragon.id);
    await DB.saveDB('users');

    removeSpawn(from);

    let resultText = `⚔️ *Capture Successful!*\n\nYou successfully captured the ${spawn.rarity} dragon: *${dragon.name}*!\nIt has been added to your party.\n\n🎏 *XP Gained:* ${gainedXP}`;

    if (xpResult.rankedUp) {
      resultText += `\n🏮 *New Rank:* ${xpResult.newRank}`;
    }

    await sock.sendMessage(from, {
      image: { url: dragon.image || 'https://placehold.co/600x400?text=Dragon' },
      caption: resultText
    });
  }
};

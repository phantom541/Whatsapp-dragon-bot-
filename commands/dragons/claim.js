import DB from '../../utils/database.js';
import { getDragon, formatDragonInfo } from '../../utils/dragons.js';
import { getUser, addXP } from '../../utils/economy.js';
import { getUserJid, getDisplayName } from '../../utils/player.js';

export default {
  name: 'claim',
  description: 'Claim a spawned dragon',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);
    const pushName = getDisplayName(msg);
    const spawnId = args[0];

    if (!spawnId) return sock.sendMessage(from, { text: 'Usage: %claim <spawnId>' });

    const spawnDb = await DB.getDB('spawns');
    const spawn = spawnDb.spawns?.[from]?.[spawnId];

    if (!spawn) return sock.sendMessage(from, { text: '❌ No such active spawn.' });

    const now = Date.now();

    // Check grace period
    if (now < spawn.catchableAfter && spawn.spawner && spawn.spawner !== jid) {
      const remaining = Math.ceil((spawn.catchableAfter - now) / 1000);
      return sock.sendMessage(from, { text: `⏳ This dragon is reserved for its spawner. Wait ${remaining}s!` });
    }

    // Check expiration
    if (now > spawn.expiresAt) {
      delete spawnDb.spawns[from][spawnId];
      await DB.saveDB('spawns');
      return sock.sendMessage(from, { text: '❌ This dragon has vanished into the wild.' });
    }

    // Success! Claim it.
    const user = await getUser(jid, pushName);

    // Add dragon to player's collection
    // In our system, we keep the dragon object in user.dragons or just the ID?
    // Let's store the full object for simplicity in profile as requested by user snippets
    const dragonCopy = { ...spawn, owner: jid, spawnId: undefined, spawnedAt: undefined, catchableAfter: undefined, expiresAt: undefined };

    user.dragons = user.dragons || [];
    user.dragons.push(dragonCopy);
    user.totalDragons = user.dragons.length;

    // Set as companion if none exists
    if (!user.companion || user.companion === 'None') {
        user.companion = dragonCopy.name;
    }

    // Remove spawn
    delete spawnDb.spawns[from][spawnId];

    await DB.saveDB('users');
    await DB.saveDB('spawns');

    // XP reward
    const rarityXP = { S: 500, A: 300, B: 150, C: 50, Common: 50, Uncommon: 100, Rare: 200, Epic: 350, Legendary: 500, Mythic: 1000 };
    const gainedXP = rarityXP[spawn.rarity] || 50;
    const xpResult = await addXP(jid, gainedXP);

    let resultText = `🎉 *Success!* You claimed *${spawn.name}*!\n\n${formatDragonInfo(spawn)}\n\n🎏 *XP Gained:* ${gainedXP}`;
    if (xpResult.rankedUp) {
      resultText += `\n🏮 *New Rank:* ${xpResult.newRank}`;
    }

    return sock.sendMessage(from, {
        image: { url: spawn.image || 'https://placehold.co/600x400?text=Dragon' },
        caption: resultText
    });
  }
};

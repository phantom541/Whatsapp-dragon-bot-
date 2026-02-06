import DB from '../../utils/database.js';
import { createDragon } from '../../utils/dragons.js';
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

    if (!spawn) return sock.sendMessage(from, { text: '❌ No such spawn or it has already been claimed.' });

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

    // Create the dragon in the player's collection
    const dragon = await createDragon(spawn, jid);

    // Add to user's dragon list
    user.dragons = user.dragons || [];
    user.dragons.push(dragon.id);
    await DB.saveDB('users');

    // Remove spawn
    delete spawnDb.spawns[from][spawnId];
    await DB.saveDB('spawns');

    // XP reward
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

    let resultText = `🎉 *Success!* You claimed *${spawn.name}*!\nIt has been added to your party.\n\n🎏 *XP Gained:* ${gainedXP}`;
    if (xpResult.rankedUp) {
      resultText += `\n🏮 *New Rank:* ${xpResult.newRank}`;
    }

    return sock.sendMessage(from, { text: resultText });
  }
};

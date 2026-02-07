import DB from '../../utils/database.js';
import { formatDragonInfo, createDragon } from '../../utils/dragons.js';
import { addXP } from '../../utils/economy.js';

export default {
  name: 'claim',
  description: 'Claim a spawned dragon',
  execute: async ({ sender, args, reply, sock, from, getPlayer, updatePlayer }) => {
    const spawnId = args[0];
    if (!spawnId) return reply('Usage: %claim <spawnId>');

    const spawnDb = await DB.getDB('spawns');
    const spawn = spawnDb.spawns?.[from]?.[spawnId];

    if (!spawn) return reply('❌ No such active spawn.');

    const now = Date.now();

    // Check grace period
    if (now < spawn.catchableAfter && spawn.spawner && spawn.spawner !== sender) {
      const remaining = Math.ceil((spawn.catchableAfter - now) / 1000);
      return reply(`⏳ This dragon is reserved for its spawner. Wait ${remaining}s!`);
    }

    // Check expiration
    if (now > spawn.expiresAt) {
      delete spawnDb.spawns[from][spawnId];
      await DB.saveDB('spawns');
      return reply('❌ This dragon has vanished into the wild.');
    }

    // Success! Claim it.
    const player = getPlayer(sender);

    // Create unique dragon instance
    const dragon = await createDragon(spawn, sender);

    player.dragons = player.dragons || [];
    player.dragons.push(dragon);
    player.totalDragons = player.dragons.length;

    if (!player.companion || player.companion === 'None') {
        player.companion = dragon.name;
    }

    // Remove spawn
    delete spawnDb.spawns[from][spawnId];

    await updatePlayer(player);
    await DB.saveDB('spawns');

    // XP reward
    const rarityXP = { S: 500, A: 300, B: 150, C: 50, Common: 50, Uncommon: 100, Rare: 200, Epic: 350, Legendary: 500, Mythic: 1000 };
    const gainedXP = rarityXP[spawn.rarity] || 50;
    const xpResult = await addXP(sender, gainedXP);

    let resultText = `🎉 *Success!* You claimed *${spawn.name}*!\n\n${formatDragonInfo(dragon)}\n\n🎏 *XP Gained:* ${gainedXP}`;
    if (xpResult.rankedUp) {
      resultText += `\n🏮 *New Rank:* ${xpResult.newRank}`;
    }

    return sock.sendMessage(from, {
        image: { url: dragon.image || 'https://placehold.co/600x400?text=Dragon' },
        caption: resultText
    });
  }
};

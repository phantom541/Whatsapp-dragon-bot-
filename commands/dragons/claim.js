import DB from '../../utils/database.js';
import { createDragon } from '../../utils/dragons.js';
import { getUser, addXP } from '../../utils/economy.js';
import { getUserJid, getDisplayName } from '../../utils/player.js';

export default {
  name: 'claim',
  description: 'Claim a spawned dragon or card',
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
      return sock.sendMessage(from, { text: `⏳ This entity is reserved for its spawner. Wait ${remaining}s!` });
    }

    // Check expiration
    if (now > spawn.expiresAt) {
      delete spawnDb.spawns[from][spawnId];
      await DB.saveDB('spawns');
      return sock.sendMessage(from, { text: '❌ This entity has vanished.' });
    }

    const user = await getUser(jid, pushName);
    const type = spawn.entityType || 'dragon';

    let resultText = '';
    let gainedXP = 0;

    if (type === 'dragon') {
        const dragon = await createDragon(spawn, jid);
        user.dragons = user.dragons || [];
        user.dragons.push(dragon.id);

        const rarityXP = { Common: 50, Uncommon: 100, Rare: 200, Epic: 350, Legendary: 500, Mythic: 1000 };
        gainedXP = rarityXP[spawn.rarity] || 50;

        resultText = `🎉 *Success!* You claimed the dragon: *${spawn.name}*!\nIt has been added to your party.`;
    } else {
        // Card claim
        const cardDb = await DB.getDB('cards');
        const card = cardDb.cards[spawn.id];

        if (card) {
            card.owners = card.owners || [];
            if (card.owners.length >= (card.maxOwners || 5)) {
                return sock.sendMessage(from, { text: '❌ This card has already reached its maximum number of owners.' });
            }
            if (card.owners.includes(jid)) {
                return sock.sendMessage(from, { text: '❌ You already own this card.' });
            }
            card.owners.push(jid);
            user.cards = (user.cards || 0) + 1;
            await DB.saveDB('cards');
        }

        const tierXP = { '1': 20, '2': 40, '3': 80, '4': 150, '5': 250, '6': 400, 'S': 1000 };
        gainedXP = tierXP[spawn.tier] || 20;

        resultText = `🎉 *Success!* You claimed the card: *${spawn.name}*!`;
    }

    // Common updates
    await DB.saveDB('users');
    delete spawnDb.spawns[from][spawnId];
    await DB.saveDB('spawns');

    const xpResult = await addXP(jid, gainedXP);
    resultText += `\n\n🎏 *XP Gained:* ${gainedXP}`;
    if (xpResult.rankedUp) {
      resultText += `\n🏮 *New Rank:* ${xpResult.newRank}`;
    }

    return sock.sendMessage(from, {
        image: { url: spawn.image || 'https://placehold.co/600x400?text=Claim' },
        caption: resultText
    });
  }
};

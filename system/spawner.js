import DB from '../utils/database.js';
import { ALL_DRAGONS } from '../data/dragon_templates.js';
import crypto from 'crypto';

function genId() {
  return crypto.randomBytes(2).toString('hex'); // 4 chars is enough for short-lived spawns
}

export async function spawnDragon(sock, groupId, spawnerId = null) {
  const spawnDb = await DB.getDB('spawns');
  spawnDb.spawns = spawnDb.spawns || {};

  // Pick a random dragon from ALL_DRAGONS
  // Filtering for 'spawnable' if we had that property, for now all are spawnable
  const dragonTemplate = ALL_DRAGONS[Math.floor(Math.random() * ALL_DRAGONS.length)];

  const spawnId = genId();
  const now = Date.now();
  const dragon = {
    ...dragonTemplate,
    spawnId,
    owner: null,
    spawner: spawnerId,
    spawnedAt: now,
    catchableAfter: now + 1 * 60 * 1000, // 1 minute window
    expiresAt: now + 5 * 60 * 1000        // 5 minute TTL
  };

  if (!spawnDb.spawns[groupId]) spawnDb.spawns[groupId] = {};
  spawnDb.spawns[groupId][spawnId] = dragon;

  await DB.saveDB('spawns');

  await sock.sendMessage(groupId, {
    image: { url: dragon.image || 'https://placehold.co/600x400?text=Dragon' },
    caption:
`🐲 *A Wild Dragon Appears!*

• Name: *${dragon.name}*
• Rarity: *${dragon.rarity}*
• Element: *${dragon.element}*
• Spawn ID: *${spawnId}*

⏳ Despawns in 5 minutes
🛡️ Grace Period: 1 minute (only spawner/none can claim)
⚔️ Type *%claim ${spawnId}* to capture!`
  });

  return { spawnId, dragon };
}

export async function autoSpawn(sock) {
  const userDb = await DB.getDB('users');
  userDb.groups = userDb.groups || {};

  for (const groupId of Object.keys(userDb.groups)) {
    const group = userDb.groups[groupId];
    if (group.wildDragonsOn) {
      await spawnDragon(sock, groupId);
    }
  }
}

export function startSpawnLoop(sock) {
  // Check every 30 minutes for auto-spawns
  setInterval(() => autoSpawn(sock), 30 * 60 * 1000);

  // Also clean up expired spawns every minute
  setInterval(async () => {
    const spawnDb = await DB.getDB('spawns');
    const now = Date.now();
    let changed = false;

    for (const groupId in spawnDb.spawns) {
      for (const spawnId in spawnDb.spawns[groupId]) {
        if (now > spawnDb.spawns[groupId][spawnId].expiresAt) {
          delete spawnDb.spawns[groupId][spawnId];
          changed = true;
        }
      }
    }

    if (changed) await DB.saveDB('spawns');
  }, 60 * 1000);
}

import DB from '../utils/database.js';
import { ALL_DRAGONS } from '../data/dragon_templates.js';
import crypto from 'crypto';

function genId() {
  return crypto.randomBytes(2).toString('hex');
}

export async function spawnDragon(sock, groupId, spawnerId = null) {
  const spawnDb = await DB.getDB('spawns');
  spawnDb.spawns = spawnDb.spawns || {};

  // Randomly decide between Dragon (70%) and Card (30%)
  const isCard = Math.random() < 0.3;
  let entity;
  let type;

  if (isCard) {
      const cardDb = await DB.getDB('cards');
      const spawnableCards = Object.values(cardDb.cards).filter(c => c.spawnable);
      entity = spawnableCards[Math.floor(Math.random() * spawnableCards.length)];
      type = 'card';
  } else {
      entity = ALL_DRAGONS[Math.floor(Math.random() * ALL_DRAGONS.length)];
      type = 'dragon';
  }

  const spawnId = genId();
  const now = Date.now();
  const spawn = {
    ...entity,
    spawnId,
    entityType: type,
    owner: null,
    spawner: spawnerId,
    spawnedAt: now,
    catchableAfter: now + 1 * 60 * 1000,
    expiresAt: now + 5 * 60 * 1000
  };

  if (!spawnDb.spawns[groupId]) spawnDb.spawns[groupId] = {};
  spawnDb.spawns[groupId][spawnId] = spawn;

  await DB.saveDB('spawns');

  const title = type === 'dragon' ? '🐲 *A Wild Dragon Appears!*' : '🎴 *A Rare Card Appears!*';
  const rarityLabel = type === 'dragon' ? 'Rarity' : 'Tier';
  const rarityVal = type === 'dragon' ? spawn.rarity : spawn.tier;

  await sock.sendMessage(groupId, {
    image: { url: spawn.image || 'https://placehold.co/600x400?text=Entity' },
    caption:
`${title}

• Name: *${spawn.name}*
• ${rarityLabel}: *${rarityVal}*
• Spawn ID: *${spawnId}*

⏳ Despawns in 5 minutes
🛡️ Grace Period: 1 minute
⚔️ Type *%claim ${spawnId}* to capture!`
  });

  return { spawnId, entity: spawn };
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
  setInterval(() => autoSpawn(sock), 30 * 60 * 1000);

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

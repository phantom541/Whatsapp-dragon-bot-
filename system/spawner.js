import DB from '../utils/database.js';
import { getRandomDragon, formatDragonInfo } from '../utils/dragons.js';
import { isWorldLocked, clearColossalBeast } from '../utils/world_state.js';
import crypto from 'crypto';

function genId() {
  return crypto.randomBytes(2).toString('hex');
}

const TTL_MS = 5 * 60 * 1000;      // 5 minutes
const CLAIM_WINDOW_MS = 1 * 60 * 1000; // 1 minute before others can claim

// Spawn a single wild dragon in a group
export async function spawnDragon(sock, groupId, spawnerId = null) {
  if (await isWorldLocked()) return null;

  const dragonTemplate = getRandomDragon();
  if (!dragonTemplate) return null;

  const spawnId = genId();
  const now = Date.now();

  const spawn = {
    ...dragonTemplate,
    spawnId,
    owner: null,           // not yet claimed
    spawner: spawnerId,    // who spawned it, if any
    spawnedAt: now,
    catchableAfter: now + CLAIM_WINDOW_MS,
    expiresAt: now + TTL_MS
  };

  const spawnDb = await DB.getDB('spawns');
  spawnDb.spawns = spawnDb.spawns || {};
  if (!spawnDb.spawns[groupId]) spawnDb.spawns[groupId] = {};
  spawnDb.spawns[groupId][spawnId] = spawn;

  await DB.saveDB('spawns');

  const title = '🐲 *A Wild Dragon Appears!*';

  await sock.sendMessage(groupId, {
    image: { url: dragonTemplate.image || 'https://placehold.co/600x400?text=Dragon' },
    caption:
`${title}

${formatDragonInfo(dragonTemplate)}
• Spawn ID: *${spawnId}*

⏳ Despawns in 5 minutes
🛡️ Grace Period: 1 minute (only spawner/none can claim)
⚔️ Type *=claim ${spawnId}* to capture!`
  });

  return { spawnId, dragon: spawn };
}

// Automatically spawn dragons in groups with wild-dragon mode on
export async function autoSpawn(sock) {
  if (await isWorldLocked()) return;

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

  // Also clean up expired spawns and Colossal Beasts every minute
  setInterval(async () => {
    // Colossal Beast auto-despawn handled by isWorldLocked or explicitly here
    await isWorldLocked();

    const spawnDb = await DB.getDB('spawns');
    const now = Date.now();
    let changed = false;

    if (spawnDb.spawns) {
        for (const groupId in spawnDb.spawns) {
            for (const spawnId in spawnDb.spawns[groupId]) {
                if (now > spawnDb.spawns[groupId][spawnId].expiresAt) {
                    delete spawnDb.spawns[groupId][spawnId];
                    changed = true;
                }
            }
        }
    }

    if (changed) await DB.saveDB('spawns');
  }, 60 * 1000);
}

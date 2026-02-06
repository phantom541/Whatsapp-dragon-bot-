import { SPAWN_CONFIG, RARITY_WEIGHTS } from '../config/spawns.js';
import { ALL_DRAGONS } from '../data/dragon_templates.js';

const activeSpawns = new Map();

function rollRarity() {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const r of RARITY_WEIGHTS) {
    cumulative += r.weight;
    if (roll <= cumulative) return r.rarity;
  }
  return 'Common';
}

function pickDragonByRarity(rarity) {
  const pool = ALL_DRAGONS.filter(d => d.rarity === rarity);
  if (pool.length === 0) return ALL_DRAGONS[0]; // Fallback
  return pool[Math.floor(Math.random() * pool.length)];
}

export function spawnDragon(sock, groupId) {
  if (activeSpawns.has(groupId)) return;

  const rarity = rollRarity();
  const dragon = pickDragonByRarity(rarity);

  const spawn = {
    id: Date.now(),
    dragonTemplate: dragon,
    rarity,
    spawnedAt: Date.now(),
    despawnAt: Date.now() + SPAWN_CONFIG.wild.lifetime,
    claimedBy: null
  };

  activeSpawns.set(groupId, spawn);

  sock.sendMessage(groupId, {
    image: { url: dragon.image || 'https://placehold.co/600x400?text=Dragon' },
    caption:
`🐲 *A Dragon Appears!*

• Name: *${dragon.name}*
• Rarity: *${rarity}*
• Element: *${dragon.element}*

⏳ Despawns in 90 seconds
⚔️ Type *%capture* to engage`
  });

  setTimeout(() => {
    const currentSpawn = activeSpawns.get(groupId);
    if (currentSpawn && currentSpawn.id === spawn.id && !currentSpawn.claimedBy) {
      activeSpawns.delete(groupId);
      sock.sendMessage(groupId, {
        text: '🌫️ The dragon vanished into the wild.'
      });
    }
  }, SPAWN_CONFIG.wild.lifetime);
}

export function getActiveSpawn(groupId) {
  return activeSpawns.get(groupId);
}

export function claimSpawn(groupId, userId) {
  const spawn = activeSpawns.get(groupId);
  if (!spawn || spawn.claimedBy) return false;

  spawn.claimedBy = userId;
  // We don't delete immediately because we might want to show who captured it in battle logic
  // But for now, we can delete it after successful claim if battle is instant
  // Actually, let's keep it until the battle is resolved or captured.
  return true;
}

export function removeSpawn(groupId) {
    activeSpawns.delete(groupId);
}

export function startSpawnLoop(sock, groupIds = []) {
  if (!groupIds || groupIds.length === 0) {
      console.warn('⚠️ No group IDs provided for spawn loop.');
      return;
  }

  function scheduleSpawn(groupId) {
    const delay =
      SPAWN_CONFIG.wild.minInterval +
      Math.random() *
      (SPAWN_CONFIG.wild.maxInterval - SPAWN_CONFIG.wild.minInterval);

    setTimeout(() => {
      spawnDragon(sock, groupId);
      scheduleSpawn(groupId);
    }, delay);
  }

  groupIds.forEach(groupId => scheduleSpawn(groupId));
}

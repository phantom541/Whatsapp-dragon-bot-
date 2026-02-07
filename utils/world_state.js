import DB from './database.js';

export async function ensureWorld() {
  const db = await DB.getDB('world');
  if (!db.worldState) {
    db.worldState = {
      colossalActive: null,
      lockExpiresAt: 0
    };
    await DB.saveDB('world');
  }
  return db.worldState;
}

export async function spawnColossalBeast(beast) {
  const db = await DB.getDB('world');
  const now = Date.now();
  db.worldState = {
    colossalActive: {
      ...beast,
      spawnedAt: now,
      exhausted: false
    },
    lockExpiresAt: now + 30 * 60 * 1000 // 30 minutes
  };
  await DB.saveDB('world');
}

export async function isWorldLocked() {
  const db = await DB.getDB('world');
  const state = db.worldState;
  if (!state || !state.colossalActive) return false;

  const now = Date.now();
  if (now > state.lockExpiresAt) {
    await clearColossalBeast();
    return false;
  }

  return true;
}

export async function clearColossalBeast() {
  const db = await DB.getDB('world');
  db.worldState = {
    colossalActive: null,
    lockExpiresAt: 0
  };
  await DB.saveDB('world');
}

export async function getActiveColossal() {
    const db = await DB.getDB('world');
    return db.worldState?.colossalActive || null;
}

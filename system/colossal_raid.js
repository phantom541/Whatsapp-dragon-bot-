import { COLOSSAL_BEASTS } from "../data/colossal_beasts.js";
import DB from "../utils/database.js";

// Spawn a random Colossal Beast for a raid
export async function spawnColossalRaid(groupId) {
  const beastTemplate = COLOSSAL_BEASTS[Math.floor(Math.random() * COLOSSAL_BEASTS.length)];

  // Deep clone
  const beast = JSON.parse(JSON.stringify(beastTemplate));

  const db = await DB.getDB('raids');
  db[groupId] = db[groupId] || {};
  db[groupId].colossal = {
    ...beast,
    spawnedAt: Date.now(),
    participants: [],
    damageDealt: {}, // Track damage per player
    defeated: false
  };

  await DB.saveDB('raids');

  return beast;
}

// Join a player to the raid
export async function joinColossalRaid(groupId, jid) {
  const db = await DB.getDB('raids');
  if (!db[groupId]?.colossal) return null;

  const raid = db[groupId].colossal;
  if (!raid.participants.includes(jid)) {
    raid.participants.push(jid);
    raid.damageDealt[jid] = 0;
  }

  await DB.saveDB('raids');
  return raid;
}

// Damage beast
export async function damageColossalBeast(groupId, jid, amount) {
  const db = await DB.getDB('raids');
  if (!db[groupId]?.colossal || db[groupId].colossal.defeated) return null;

  const raid = db[groupId].colossal;
  raid.hp -= amount;

  // Track individual damage
  raid.damageDealt[jid] = (raid.damageDealt[jid] || 0) + amount;

  if (raid.hp <= 0) {
    raid.hp = 0;
    raid.defeated = true;
  }

  await DB.saveDB('raids');
  return raid;
}

export async function getActiveRaid(groupId) {
  const db = await DB.getDB('raids');
  if (!db[groupId]?.colossal || db[groupId].colossal.defeated) return null;
  return db[groupId].colossal;
}

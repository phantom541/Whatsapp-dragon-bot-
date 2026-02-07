import fs from 'fs';
import path from 'path';
import DB from './database.js';

const DRAGON_FILE = path.resolve('./database/dragons.json');

let DRAGONS_CACHE = null;

// Load dragons from JSON into memory
export function loadDragons() {
  if (DRAGONS_CACHE) return DRAGONS_CACHE;
  if (!fs.existsSync(DRAGON_FILE)) {
      fs.writeFileSync(DRAGON_FILE, JSON.stringify({ dragons: {} }, null, 2));
  }
  const raw = fs.readFileSync(DRAGON_FILE, 'utf-8');
  const data = JSON.parse(raw);
  DRAGONS_CACHE = data.dragons || {};
  return DRAGONS_CACHE;
}

// Get a dragon by ID
export function getDragon(id) {
  const dragons = loadDragons();
  return dragons[id] || null;
}

// Pick a random dragon for spawns
export function getRandomDragon() {
  const dragons = loadDragons();
  const keys = Object.keys(dragons);
  if (keys.length === 0) return null;
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return dragons[randKey];
}

// Example function to get dragon info formatted for display
export function formatDragonInfo(dragon) {
  if (!dragon) return "Dragon not found.";
  const moves = dragon.moves || [];
  const movesList = moves.map(m => typeof m === 'string' ? m : m.name).join(', ');

  return `
🛡️ *${dragon.name}* (${dragon.type} / ${dragon.species || 'Unknown'})
Level: ${dragon.level || 1}
Moves: ${movesList || 'None'}
  `;
}

export async function createDragon(template, ownerJid) {
  const db = await DB.getDB('dragons');
  db.dragons = db.dragons || {};

  const id = `d${Date.now()}${Math.floor(Math.random()*1000)}`;

  const dragon = {
    ...template, // Carry over all template data
    id,
    templateId: template.id || null,
    name: template.name,
    type: template.type || template.element,
    species: template.species || 'Unknown',
    rarity: template.rarity,

    level: template.level || 1,
    exp: 0,

    owner: ownerJid,
    inParty: true,

    hp: template.hp || template.baseHp || 50,
    maxHp: template.maxHp || template.baseHp || 50,
    atk: template.atk || template.baseAtk || 10,
    def: template.def || template.baseDef || 5,
    pp: template.pp || template.basePp || 20,
    maxPp: template.maxPp || template.basePp || 20,

    moves: template.moves || [],
    image: template.image,
    createdAt: Date.now()
  };

  // Clean up any spawn-specific fields if they leaked in
  delete dragon.spawnId;
  delete dragon.spawner;
  delete dragon.spawnedAt;
  delete dragon.catchableAfter;
  delete dragon.expiresAt;

  db.dragons[id] = dragon;
  await DB.saveDB('dragons');

  return dragon;
}

// Added this for backward compatibility with previous steps if needed
export function getPlayerDragons(ownerJid) {
    // This needs dragons in the main dragons DB to have an owner field or we filter by the list in user profile
    // My previous implementation used IDs in user profile and objects in dragons DB.
    // I'll keep it simple for now as per user's latest blueprints.
    const dragons = loadDragons();
    return Object.values(dragons).filter(d => d.owner === ownerJid);
}

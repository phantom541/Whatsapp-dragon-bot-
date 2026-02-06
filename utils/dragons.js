import crypto from 'crypto';
import DB from './database.js';

function genDragonId() {
  return crypto.randomBytes(6).toString('hex');
}

export async function createDragon(template, ownerJid) {
  const db = await DB.getDB('dragons');
  db.dragons = db.dragons || {};

  const id = genDragonId();

  const dragon = {
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

    hp: template.baseHp || 50,
    maxHp: template.baseHp || 50,
    atk: template.baseAtk || 10,
    def: template.baseDef || 5,
    pp: template.basePp || 20,
    maxPp: template.basePp || 20,

    moves: template.moves || [],
    image: template.image,
    createdAt: Date.now()
  };

  db.dragons[id] = dragon;
  await DB.saveDB('dragons');

  return dragon;
}

export async function getPlayerDragons(ownerJid) {
  const db = await DB.getDB('dragons');
  return Object.values(db.dragons || {}).filter(
    d => d.owner === ownerJid
  );
}

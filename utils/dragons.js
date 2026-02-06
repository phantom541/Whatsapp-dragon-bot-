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
    name: template.name,
    type: template.type,
    rarity: template.rarity,

    level: 1,
    exp: 0,

    owner: ownerJid,
    inParty: true,

    hp: template.baseHp,
    atk: template.baseAtk,
    def: template.baseDef,

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

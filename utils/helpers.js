import DB from './database.js';

const OWNER_NUMBERS = []; // YOU will fill this later

export function getUserId(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

export async function isOwner(userId) {
  return OWNER_NUMBERS.includes(userId);
}

export async function isMod(userId, groupId) {
  const db = await DB.readJSON('users.json');
  return db.users?.[groupId]?.mods?.includes(userId);
}

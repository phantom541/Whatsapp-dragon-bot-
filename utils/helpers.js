import DB from './database.js';

const OWNER_NUMBERS = []; // YOU will fill this later

export function getUserId(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

export async function isOwner(userId) {
  return OWNER_NUMBERS.includes(userId);
}

export async function isMod(userId) {
  const db = await DB.getDB('users');
  const user = db.users?.[userId];
  return user?.roles?.includes('mod') || user?.admin;
}

export async function hasRole(userId, role) {
    const db = await DB.getDB('users');
    const user = db.users?.[userId];
    if (user?.admin || await isOwner(userId)) return true;
    return user?.roles?.includes(role);
}

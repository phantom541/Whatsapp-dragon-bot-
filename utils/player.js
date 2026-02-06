import DB from './database.js';
import { getDefaultRank } from './ranks.js';

export function getUserJid(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

export function getUserNumber(jid) {
  return jid.split('@')[0];
}

export function getDisplayName(msg) {
  return msg.pushName || 'Unknown';
}

export async function getOrCreatePlayer(msg) {
  const db = await DB.getDB();
  const jid = getUserJid(msg);
  const number = getUserNumber(jid);
  const name = getDisplayName(msg);

  if (!db.users[jid]) {
    db.users[jid] = {
      jid,
      number,
      name,
      bio: '',
      exp: 0,
      rank: getDefaultRank(),
      gold: 1000,
      bank: 0,
      cards: 0,
      dragons: [],
      admin: false,
      banned: false,
      lastDaily: 0,
      createdAt: new Date().toISOString()
    };

    await DB.saveDB();
  } else {
    // update name if user changed it on WhatsApp
    if (db.users[jid].name !== name) {
      db.users[jid].name = name;
      await DB.saveDB();
    }
  }

  return db.users[jid];
}

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
  const db = await DB.getDB('users');
  const jid = getUserJid(msg);
  const number = getUserNumber(jid);
  const name = getDisplayName(msg);

  if (!db.users[jid]) {
    db.users[jid] = {
      jid,
      number,
      name,
      username: "@None",
      webSecurity: "Nope",
      bio: "None",
      exp: 0,
      rank: getDefaultRank(),
      gold: 1000,
      bank: 0,
      cards: 0,
      dragons: [],
      haigusha: "None",
      quizWins: 0,
      admin: false,
      banned: false,
      inBattle: {
        active: false,
        lastBattle: 0
      },
      lastDaily: 0,
      createdAt: new Date().toISOString()
    };

    await DB.saveDB('users');
  } else {
    // update name if user changed it on WhatsApp
    if (db.users[jid].name !== name) {
      db.users[jid].name = name;
      await DB.saveDB('users');
    }
  }

  return db.users[jid];
}

import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('./database/users.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function getUserJid(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

export function getUserNumber(jid) {
  return jid.split('@')[0];
}

export function getDisplayName(msg) {
  return msg.pushName || 'Unknown';
}

export function getOrCreatePlayer(msg) {
  const db = readDB();

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
      rank: '🎯 Rookie',
      gold: 1000,
      cards: 0,
      dragons: [],
      admin: false,
      banned: false,
      createdAt: new Date().toISOString()
    };

    saveDB(db);
  } else {
    // update name if user changed it on WhatsApp
    if (db.users[jid].name !== name) {
      db.users[jid].name = name;
      saveDB(db);
    }
  }

  return db.users[jid];
}

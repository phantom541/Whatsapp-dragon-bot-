import DB from './database.js';
import { getRankData, getDefaultRank, getRankForXP } from './ranks.js';

export async function getUser(jid, name = 'Unknown') {
  const db = await DB.getDB();
  db.users = db.users || {};

  if (!db.users[jid]) {
    db.users[jid] = {
      jid,
      name,
      gold: 1000, // Starting gold as mentioned in some snippets
      bank: 0,
      rank: getDefaultRank(),
      exp: 0,
      lastDaily: 0,
      dragons: [],
      cards: 0,
      banned: false,
      admin: false,
      createdAt: new Date().toISOString()
    };
    await DB.saveDB();
  }

  return db.users[jid];
}

export async function addGold(jid, amount) {
  const db = await DB.getDB();
  const user = db.users[jid];
  if (!user) return false;

  user.gold += Math.max(0, amount);
  await DB.saveDB();
  return true;
}

export async function canClaimDaily(jid) {
  const db = await DB.getDB();
  const user = db.users[jid];
  if (!user) return false;

  const now = Date.now();
  return now - user.lastDaily >= 24 * 60 * 60 * 1000;
}

export async function claimDaily(jid) {
  const db = await DB.getDB();
  const user = db.users[jid];
  if (!user) return null;

  if (!(await canClaimDaily(jid))) return null;

  const rank = getRankData(user.rank);
  user.gold += rank.daily;
  user.lastDaily = Date.now();

  await DB.saveDB();
  return rank.daily;
}

export async function addXP(jid, amount) {
  const db = await DB.getDB();
  const user = db.users[jid];
  if (!user) return { ok: false };

  const oldRank = user.rank;
  user.exp = (user.exp || 0) + amount;

  const newRank = getRankForXP(user.exp);
  let rankedUp = false;
  if (newRank !== oldRank) {
    user.rank = newRank;
    rankedUp = true;
  }

  await DB.saveDB();
  return { ok: true, exp: user.exp, rankedUp, oldRank, newRank };
}

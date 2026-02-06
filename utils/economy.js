import DB from './database.js';
import { getRankData, getDefaultRank, getRankForXP } from './ranks.js';

export async function getUser(jid, name = 'Unknown') {
  const db = await DB.getDB('users');
  db.users = db.users || {};

  if (!db.users[jid]) {
    db.users[jid] = {
      jid,
      name,
      username: "@None",
      webSecurity: "Nope",
      bio: "None",
      gold: 1000,
      bank: 0,
      rank: getDefaultRank(),
      exp: 0,
      lastDaily: 0,
      dragons: [],
      cards: 0,
      haigusha: "None",
      quizWins: 0,
      banned: false,
      admin: false,
      inBattle: {
        active: false,
        lastBattle: 0
      },
      createdAt: new Date().toISOString()
    };
    await DB.saveDB('users');
  }

  // Ensure newer fields exist for older users
  const user = db.users[jid];
  if (!user.inBattle) user.inBattle = { active: false, lastBattle: 0 };
  if (user.exp === undefined) user.exp = user.experience || 0;
  if (user.gold === undefined) user.gold = user.wallet || 1000;

  return user;
}

export async function addGold(jid, amount) {
  const db = await DB.getDB('users');
  const user = db.users[jid];
  if (!user) return false;

  user.gold = (user.gold || 0) + Math.max(0, amount);
  await DB.saveDB('users');
  return true;
}

export async function canClaimDaily(jid) {
  const db = await DB.getDB('users');
  const user = db.users[jid];
  if (!user) return false;

  const now = Date.now();
  return now - (user.lastDaily || 0) >= 24 * 60 * 60 * 1000;
}

export async function claimDaily(jid) {
  const db = await DB.getDB('users');
  const user = db.users[jid];
  if (!user) return null;

  if (!(await canClaimDaily(jid))) return null;

  const rank = getRankData(user.rank);
  user.gold = (user.gold || 0) + rank.daily;
  user.lastDaily = Date.now();

  await DB.saveDB('users');
  return rank.daily;
}

export async function addXP(jid, amount) {
  const db = await DB.getDB('users');
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

  await DB.saveDB('users');
  return { ok: true, exp: user.exp, rankedUp, oldRank, newRank };
}

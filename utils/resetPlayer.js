import DB from "./database.js";

export async function resetPlayer(jid) {
  const db = await DB.getDB('users');
  const user = db.users[jid];
  if (!user) return;

  user.gold = 0;
  user.bank = 0;
  user.exp = 0;
  user.rank = "Hatchling"; // Default rank
  user.inventory = { items: {} };
  user.party = [];
  user.dragons = [];
  user.denLockedUntil = Date.now() + 24 * 60 * 60 * 1000;

  await DB.saveDB('users');
  return true;
}

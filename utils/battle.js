import DB from './database.js';
import { addXP } from './economy.js';

// Calculate damage from attacker to defender
function calculateDamage(attacker, defender) {
  const base = attacker.atk || 10;
  const defense = defender.def || 5;
  // simple formula: random factor ±10%
  const multiplier = 0.9 + Math.random() * 0.2;
  const damage = Math.max(1, Math.floor((base - defense / 2) * multiplier));
  return damage;
}

// Fight two dragons, returns result object
export async function fightDragons(player1Id, dragon1Id, player2Id, dragon2Id) {
  const db = await DB.getDB('dragons');
  db.dragons = db.dragons || {};

  const dragon1 = db.dragons[dragon1Id];
  const dragon2 = db.dragons[dragon2Id];

  if (!dragon1 || !dragon2) return { ok: false, reason: 'Dragon not found' };

  // Turn-based simple battle
  let hp1 = dragon1.hp || 50;
  let hp2 = dragon2.hp || 50;
  let turn = 0;
  const log = [];

  while (hp1 > 0 && hp2 > 0 && turn < 50) { // Safety turn limit
    if (turn % 2 === 0) {
      const dmg = calculateDamage(dragon1, dragon2);
      hp2 -= dmg;
      log.push(`⚔️ *${dragon1.name}* hits *${dragon2.name}* for ${dmg} damage (HP: ${Math.max(0, hp2)})`);
    } else {
      const dmg = calculateDamage(dragon2, dragon1);
      hp1 -= dmg;
      log.push(`⚔️ *${dragon2.name}* hits *${dragon1.name}* for ${dmg} damage (HP: ${Math.max(0, hp1)})`);
    }
    turn++;
  }

  const winner = hp1 > 0 ? dragon1 : dragon2;
  const winnerId = hp1 > 0 ? player1Id : player2Id;
  const loser = hp1 > 0 ? dragon2 : dragon1;

  // Reward XP to winner dragon
  winner.exp = (winner.exp || 0) + 50;

  // Level up dragon if exp > level * 100
  if (winner.exp >= winner.level * 100) {
      winner.level++;
      winner.atk += 2;
      winner.def += 1;
      winner.hp += 5;
      log.push(`🌟 *${winner.name}* leveled up to ${winner.level}!`);
  }

  await DB.saveDB('dragons');

  // Also reward XP to the player
  let rankUpMsg = '';
  if (winnerId) {
    const xpResult = await addXP(winnerId, 50);
    if (xpResult.rankedUp) {
        rankUpMsg = `\n🏮 *New Rank:* ${xpResult.newRank}`;
    }
  }

  return {
    ok: true,
    winner,
    loser,
    log,
    rankUpMsg
  };
}

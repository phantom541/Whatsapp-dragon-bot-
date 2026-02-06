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
  const dragDb = await DB.getDB('dragons');
  const userDb = await DB.getDB('users');

  const dragon1 = dragDb.dragons[dragon1Id];
  const dragon2 = dragDb.dragons[dragon2Id];

  if (!dragon1 || !dragon2) return { ok: false, reason: 'Dragon not found' };

  // Turn-based simple battle
  let hp1 = dragon1.hp || 50;
  let hp2 = dragon2.hp || 50;

  // Initialize PP if missing
  dragon1.pp = dragon1.pp !== undefined ? dragon1.pp : (dragon1.maxPp || 20);
  dragon2.pp = dragon2.pp !== undefined ? dragon2.pp : (dragon2.maxPp || 20);

  let turn = 0;
  const log = [];

  while (hp1 > 0 && hp2 > 0 && turn < 50) { // Safety turn limit
    if (turn % 2 === 0) {
      const dmg = calculateDamage(dragon1, dragon2);
      hp2 -= dmg;
      dragon1.pp = Math.max(0, dragon1.pp - 1);
      log.push(`⚔️ *${dragon1.name}* hits *${dragon2.name}* for ${dmg} damage (HP: ${Math.max(0, hp2)})`);
    } else {
      const dmg = calculateDamage(dragon2, dragon1);
      hp1 -= dmg;
      dragon2.pp = Math.max(0, dragon2.pp - 1);
      log.push(`⚔️ *${dragon2.name}* hits *${dragon1.name}* for ${dmg} damage (HP: ${Math.max(0, hp1)})`);
    }
    turn++;
  }

  const winner = hp1 > 0 ? dragon1 : dragon2;
  const winnerId = hp1 > 0 ? player1Id : player2Id;
  const loser = hp1 > 0 ? dragon2 : dragon1;

  // Update dragon HP and PP
  dragon1.hp = Math.max(0, hp1);
  dragon2.hp = Math.max(0, hp2);

  // Reward XP to winner dragon
  winner.exp = (winner.exp || 0) + 50;
  loser.exp = (loser.exp || 0) + 20; // loser still gets some XP

  // Level up logic for winner dragon
  let xpNeeded = 100 + (winner.level || 1) * 50;
  let leveledUp = false;
  while (winner.exp >= xpNeeded && (winner.level || 1) < 50) {
      winner.exp -= xpNeeded;
      winner.level = (winner.level || 1) + 1;
      winner.atk = (winner.atk || 10) + 2;
      winner.def = (winner.def || 5) + 1;
      winner.maxHp = (winner.maxHp || 50) + 10;
      winner.maxPp = (winner.maxPp || 20) + 2;
      winner.hp = winner.maxHp;
      winner.pp = winner.maxPp;
      leveledUp = true;
      xpNeeded = 100 + winner.level * 50;
  }
  if (leveledUp) {
      log.push(`🌟 *${winner.name}* leveled up to ${winner.level}! Stats increased.`);
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

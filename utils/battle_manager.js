import { getActiveBeast, defeatBeast } from './colossal_manager.js';
import { getPlayerProfile, updatePlayer } from './rpg_user_manager.js';
import DB from './database.js';
import { handleColossalBeastVictory } from './colossal_rewards.js';

export const battleContextStore = {};

export async function startColossalBattle(playerJid) {
  const player = await getPlayerProfile(playerJid);
  if (!player) throw new Error('Player not found');

  const beast = await getActiveBeast();
  if (!beast) return { success: false, message: '🏜️ No Colossal Beast is currently active in the world.' };

  // Note: For simplicity, we allow anyone to fight, but track a "current fighter" flag in memory if we wanted 1v1 exclusivity
  // The user prompt said "1v1 only", so let's enforce it in memory.
  if (beast.currentFighter && beast.currentFighter !== playerJid) {
    return { success: false, message: '⚔️ Another player is already fighting this Colossal Beast.' };
  }

  beast.currentFighter = playerJid;

  // Player stats scaling
  const playerAttack = player.dragons?.reduce((sum, d) => sum + (d.atk || 10), 0) || 10;
  const playerHP = player.dragons?.reduce((sum, d) => sum + (d.hp || 50), 0) || 50;

  const battleContext = {
    player,
    playerHP,
    playerMaxHP: playerHP,
    playerAttack,
    opponent: { ...beast, currentHP: beast.hp, attack: beast.attack },
    battleType: 'colossal',
    isColossal: true
  };

  battleContextStore[playerJid] = battleContext;

  // Sync to users DB session for other commands
  const usersDb = await DB.getDB('users');
  usersDb.sessions = usersDb.sessions || {};
  usersDb.sessions[playerJid] = {
      inBattle: true,
      battleType: 'colossal',
      isColossal: true,
      wildDragon: { ...beast, hp: beast.hp, maxHp: beast.hp } // compatibility for =use
  };
  await DB.saveDB('users');

  return { success: true, battleContext, message: `🦖 *Colossal Beast ${beast.name}* has appeared! Prepare for battle.` };
}

export async function playerAttackColossal(playerJid) {
  const context = battleContextStore[playerJid];
  if (!context) return '❌ You are not in a battle.';

  const { opponent, playerAttack } = context;

  // Player hit
  const playerDmg = Math.floor(playerAttack * (0.8 + Math.random() * 0.4));
  opponent.currentHP -= playerDmg;

  let response = `⚔️ You attacked *${opponent.name}* for ${playerDmg} damage!`;

  if (opponent.currentHP <= 0) {
    const rewardMsg = await handleColossalBeastVictory(playerJid, opponent);
    await defeatBeast();
    delete battleContextStore[playerJid];

    const usersDb = await DB.getDB('users');
    if (usersDb.sessions?.[playerJid]) delete usersDb.sessions[playerJid];
    await DB.saveDB('users');

    return response + `\n\n` + rewardMsg;
  }

  // Beast counterattack
  const beastMove = opponent.moves[Math.floor(Math.random() * opponent.moves.length)];
  const beastDmg = Math.floor(opponent.attack * (0.5 + Math.random() * 0.5));

  context.playerHP -= beastDmg;
  response += `\n🦖 *${opponent.name}* uses *${beastMove}* and deals ${beastDmg} damage!`;

  if (context.playerHP <= 0) {
    opponent.currentFighter = null;
    delete battleContextStore[playerJid];

    const usersDb = await DB.getDB('users');
    if (usersDb.sessions?.[playerJid]) delete usersDb.sessions[playerJid];
    await DB.saveDB('users');

    return response + `\n\n💀 You were defeated by *${opponent.name}*. You escaped, wounded.`;
  } else {
    response += `\n❤️ Your HP: ${context.playerHP} | Beast HP: ${opponent.currentHP}`;
  }

  return response;
}

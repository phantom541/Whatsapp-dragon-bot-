import { getPlayerProfile, updatePlayer } from './rpg_user_manager.js';
import { createDragon } from './dragons.js';

export async function handleColossalBeastVictory(playerJid, beast) {
  const player = await getPlayerProfile(playerJid);
  if (!player) throw new Error('Player not found');

  player.colossalBeastsDefeated = player.colossalBeastsDefeated || [];
  player.achievements = player.achievements || [];

  // Add beast to player collection (as a dragon)
  const dragon = await createDragon(beast, playerJid);
  player.dragons = player.dragons || [];
  player.dragons.push(dragon);

  // Record defeat
  if (!player.colossalBeastsDefeated.includes(beast.id)) {
    player.colossalBeastsDefeated.push(beast.id);
  }

  // Rewards
  const rewardGold = 1_000_000_000;
  const rewardXP = 500_000;

  if (player.progression) {
      player.progression.gold += rewardGold;
      player.progression.xp += rewardXP;
  } else {
      player.gold = (player.gold || 0) + rewardGold;
      player.exp = (player.exp || 0) + rewardXP;
  }

  // Titles & Promotions
  const count = player.colossalBeastsDefeated.length;
  let promoMsg = '';

  if (count === 1 && !player.achievements.includes('Beast Slayer I')) {
      player.achievements.push('Beast Slayer I');
  }

  if (count === 3) {
      if (!player.achievements.includes('Beast Slayer III')) player.achievements.push('Beast Slayer III');
      if (!player.roles.includes('mod')) {
          player.roles.push('mod');
          promoMsg += `\n🎖️ *Congratulations! You have been promoted to MOD!*`;
      }
  }

  if (count === 7) {
      if (!player.achievements.includes('Ultimate Beast Slayer')) player.achievements.push('Ultimate Beast Slayer');
      if (!player.roles.includes('owner')) {
          player.roles.push('owner');
          promoMsg += `\n🏆 *Amazing! You have been promoted to OWNER!*`;
      }
  }

  await updatePlayer(player);

  let response = `🏆 *You defeated ${beast.name}!* 🏆\n\n` +
                 `💰 *Gold:* ${rewardGold.toLocaleString()}\n` +
                 `✨ *XP:* ${rewardXP.toLocaleString()}\n` +
                 `🐉 *${beast.name}* has been added to your den!${promoMsg}`;

  return response;
}

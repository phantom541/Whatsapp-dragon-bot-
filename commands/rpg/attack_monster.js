import DB from '../../utils/database.js';
import { getPlayerGuild } from '../../utils/guild_manager.js';
import { applyGuildStatBuffs, applyGuildRewardsBuff } from '../../utils/guild_buffs.js';

export default {
  name: 'attackmonster',
  aliases: ['am'],
  description: 'Attack a monster in the current dungeon floor.',
  execute: async ({ sender, reply, from, getPlayer, updatePlayer }) => {
    const dungeonDb = await DB.getDB('dungeons');
    const dungeon = dungeonDb[from]?.find(d => d.status === 'active');

    if (!dungeon) return reply('🏰 No active dungeon in this group.');

    if (dungeon.monstersRemaining.length === 0)
      return reply('✅ No monsters remaining on this floor. Use *=attackboss* or *=nextfloor*.');

    const player = getPlayer(sender);
    const guild = await getPlayerGuild(sender);
    let dragon = player.dragons?.[0]; // Default to first dragon

    if (!dragon || dragon.hp <= 0) {
      return reply('❌ Your dragon is unable to fight! Heal it first.');
    }

    // Apply guild buffs to stats for the duration of this calculation
    if (guild) {
        dragon = applyGuildStatBuffs(guild, dragon);
    }

    // Target first monster
    const monster = dungeon.monstersRemaining[0];

    // Pick dragon move
    const move = dragon.moves[Math.floor(Math.random() * dragon.moves.length)];
    const moveName = typeof move === 'string' ? move : move.name;

    // Player attack
    let damage = (dragon.atk || 10) * (Math.random() * 5 + 5);
    // Affinity/Weakness
    const dragonType = (dragon.type || dragon.affinity || "").toLowerCase();
    const isWeak = monster.weaknesses.some(w => w.toLowerCase() === dragonType);
    if (isWeak) damage *= 1.5;

    damage = Math.floor(Math.min(damage, monster.currentHp));
    monster.currentHp -= damage;

    let replyText = `⚔️ *${dragon.name}* used *${moveName}* on *${monster.name}* dealing ${damage} damage.\n`;
    if (isWeak) replyText += `✨ It's super effective!\n`;

    // Monster counterattack if still alive
    if (monster.currentHp > 0) {
      const monsterMove = monster.moves[Math.floor(Math.random() * monster.moves.length)];
      let counterDamage = (monster.stats.atk || 10) * (Math.random() * 5 + 5);

      // Simple defense reduction
      counterDamage = Math.max(5, counterDamage - (dragon.def || 5));
      counterDamage = Math.floor(Math.min(counterDamage, dragon.hp));

      dragon.hp -= counterDamage;
      if (dragon.hp < 0) dragon.hp = 0;
      await updatePlayer(player);

      replyText += `🛡️ *${monster.name}* used *${monsterMove}* on *${dragon.name}* dealing ${counterDamage} damage.\n`;
      replyText += `💖 Dragon HP: ${dragon.hp} | Monster HP: ${monster.currentHp}`;
    } else {
      // Monster defeated
      dungeon.monstersRemaining.shift();

      // Reward player
      let baseRewards = { gold: monster.reward?.gold || 50, xp: monster.reward?.xp || 30 };
      if (guild) {
          baseRewards = applyGuildRewardsBuff(guild, baseRewards);
      }

      player.gold += baseRewards.gold;
      player.exp += baseRewards.xp;
      player.roles = player.roles || [];
      if (monster.reward?.title && !player.roles.includes(monster.reward.title)) {
        player.roles.push(monster.reward.title);
      }
      await updatePlayer(player);

      replyText += `\n✅ *${monster.name}* defeated! Rewards: ${baseRewards.gold} gold, ${baseRewards.xp} XP${guild ? ' (Guild Boosted)' : ''}`;
      if (dungeon.monstersRemaining.length > 0) {
          replyText += `\n⚔️ Next monster: *${dungeon.monstersRemaining[0].name}*`;
      } else {
          replyText += `\n🏢 Floor cleared! Use *=attackboss* if present or *=nextfloor*.`;
      }
    }

    await DB.saveDB('dungeons');
    reply(replyText);
  }
};

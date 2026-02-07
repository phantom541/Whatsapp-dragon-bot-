import DB from '../../utils/database.js';

export default {
  name: 'attackboss',
  aliases: ['ab'],
  description: 'Attack the floor boss of the current dungeon.',
  execute: async ({ sender, reply, from, getPlayer, updatePlayer }) => {
    const dungeonDb = await DB.getDB('dungeons');
    const dungeon = dungeonDb[from]?.find(d => d.status === 'active');

    if (!dungeon) return reply('🏰 No active dungeon in this group.');
    if (!dungeon.floorBoss) return reply('✅ The boss for this floor has already been defeated. Use *%nextfloor*.');

    if (dungeon.monstersRemaining.length > 0) {
        return reply(`❌ You must defeat the remaining ${dungeon.monstersRemaining.length} monsters first!`);
    }

    const player = getPlayer(sender);
    const dragon = player.dragons?.[0];

    if (!dragon || dragon.hp <= 0) {
      return reply('❌ Your dragon is unable to fight! Heal it first.');
    }

    const boss = dungeon.floorBoss;

    // Pick dragon move
    const move = dragon.moves[Math.floor(Math.random() * dragon.moves.length)];
    const moveName = typeof move === 'string' ? move : move.name;

    // Player attack
    let damage = (dragon.atk || 10) * (Math.random() * 5 + 5);

    // Weakness check
    const dragonType = (dragon.type || dragon.affinity || "").toLowerCase();
    // Assuming dungeon bosses have weaknesses in their data structure (from data/dungeon_bosses.js)
    // Looking at data/dungeon_bosses.js, they don't have an explicit weaknesses array in the blueprint given by the user
    // but the user's provided code for attackboss uses boss.weaknesses.
    // I'll add a generic check or just rely on the data.
    const isWeak = boss.weaknesses?.some(w => w.toLowerCase() === dragonType);
    if (isWeak) damage *= 1.5;

    damage = Math.floor(Math.min(damage, boss.currentHp));
    boss.currentHp -= damage;

    let replyText = `⚔️ *${dragon.name}* used *${moveName}* on Boss *${boss.name}* dealing ${damage} damage.\n`;
    if (isWeak) replyText += `✨ It's super effective!\n`;

    // Boss counterattack
    if (boss.currentHp > 0) {
      const bossMove = boss.moves[Math.floor(Math.random() * boss.moves.length)];
      let counterDamage = (boss.atk || boss.attack || 20) * (Math.random() * 5 + 5);

      counterDamage = Math.max(10, counterDamage - (dragon.def || 5));
      counterDamage = Math.floor(Math.min(counterDamage, dragon.hp));

      dragon.hp -= counterDamage;
      if (dragon.hp < 0) dragon.hp = 0;
      await updatePlayer(player);

      replyText += `🛡️ *${boss.name}* used *${bossMove}* on *${dragon.name}* dealing ${counterDamage} damage.\n`;
      replyText += `💖 Dragon HP: ${dragon.hp} | Boss HP: ${boss.currentHp}`;
    } else {
      // Boss defeated
      player.gold += (boss.reward?.gold || 200);
      player.exp += (boss.reward?.xp || 150);
      player.roles = player.roles || [];
      const title = boss.title || (boss.reward?.title);
      if (title && !player.roles.includes(title)) {
        player.roles.push(title);
      }
      await updatePlayer(player);

      // Clear floorBoss
      dungeon.floorBoss = null;

      replyText += `\n🏆 Boss *${boss.name}* defeated! Rewards: ${boss.reward?.gold || 200} gold, ${boss.reward?.xp || 150} XP`;
      if (title) replyText += `\n🎖️ New Title: *${title}*`;
      replyText += `\n➡️ Use *%nextfloor* to advance.`;
    }

    await DB.saveDB('dungeons');
    reply(replyText);
  }
};

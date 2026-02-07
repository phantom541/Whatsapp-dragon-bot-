import { DUNGEON_MONSTERS } from "../../data/monsters.js";
import { DUNGEON_BOSSES } from "../../data/dungeon_bosses.js";
import { getActiveDungeon } from "../../system/dungeon_spawner.js";
import DB from "../../utils/database.js";

const DIFFICULTY_MODIFIER = {
  easy: 0,
  nice: 2,
  normal: 5,
  hard: 10,
  extreme: 20,
  crazy: 35,
  nightmare: 50
};

export default {
  name: "explore",
  description: "Explore the current dungeon",
  execute: async ({ sender, reply, from, getPlayer, sock }) => {
    const dungeon = await getActiveDungeon(from);
    if (!dungeon) {
      return reply('🏰 There is no active dungeon. Use *%dungeon spawn* to start one.');
    }

    const usersDb = await DB.getDB('users');
    if (usersDb.sessions?.[sender]?.inBattle) {
      return reply('❌ You are already in a battle!');
    }

    const player = getPlayer(sender);
    if (!player.dragons || player.dragons.length === 0) {
      return reply('❌ You need a dragon to explore! Use *%startdragon* first.');
    }

    // Determine if we meet the boss
    // For now, let's say 10% chance if 5 monsters defeated, 50% if 10, 100% if 15.
    let faceBoss = false;
    if (dungeon.monstersDefeated >= 15) faceBoss = true;
    else if (dungeon.monstersDefeated >= 10 && Math.random() < 0.5) faceBoss = true;
    else if (dungeon.monstersDefeated >= 5 && Math.random() < 0.1) faceBoss = true;

    let enemy;
    if (faceBoss) {
      enemy = JSON.parse(JSON.stringify(dungeon.boss));
      enemy.isBoss = true;
    } else {
      const monsterTemplate = DUNGEON_MONSTERS[Math.floor(Math.random() * DUNGEON_MONSTERS.length)];
      enemy = JSON.parse(JSON.stringify(monsterTemplate));

      const modifier = DIFFICULTY_MODIFIER[dungeon.difficulty] || 0;
      enemy.level = enemy.baseLevel + modifier + Math.floor(Math.random() * 3);

      // Scale stats
      const levelDiff = enemy.level - enemy.baseLevel;
      const scaleFactor = 1 + (levelDiff * 0.1); // +10% per level above base

      enemy.hp = Math.floor(enemy.stats.hp * scaleFactor);
      enemy.maxHp = enemy.hp;
      enemy.atk = Math.floor(enemy.stats.atk * scaleFactor);
      enemy.def = Math.floor(enemy.stats.def * scaleFactor);
      enemy.spd = Math.floor(enemy.stats.spd * scaleFactor);
      enemy.isDungeonMonster = true;
    }

    // Set up battle session
    usersDb.sessions = usersDb.sessions || {};
    usersDb.sessions[sender] = {
      inBattle: true,
      opponent: 'WILD', // Reuse WILD logic in attack.js
      isDungeon: true,
      dungeonId: dungeon.id,
      activeDragonIndex: 0,
      wildDragon: enemy,
      turn: true
    };

    player.inBattle.active = true;
    await DB.saveDB('users');

    const title = enemy.isBoss ? `⚠️ *BOSS ENCOUNTER: ${enemy.name}* ⚠️` : `👾 *A Wild ${enemy.name} appears!*`;
    const caption = `${title}\n\n` +
      `📈 *Level:* ${enemy.level || '??'}\n` +
      `❤️ *HP:* ${enemy.hp}\n` +
      `⚔️ *Attack:* ${enemy.atk}\n` +
      `🛡️ *Defense:* ${enemy.def}\n\n` +
      `Use *%attack <move>* to fight!`;

    if (enemy.image) {
      await sock.sendMessage(from, { image: { url: enemy.image }, caption });
    } else {
      reply(caption);
    }
  }
};

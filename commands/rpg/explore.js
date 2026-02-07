import { DUNGEON_MONSTERS } from "../../data/monsters.js";
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

    if (!dungeon.players.includes(sender)) {
      return reply('❌ You must enter the dungeon first! Use *%dungeon enter*.');
    }

    const usersDb = await DB.getDB('users');
    if (usersDb.sessions?.[sender]?.inBattle) {
      return reply('❌ You are already in a battle!');
    }

    const player = getPlayer(sender);
    if (!player.dragons || player.dragons.length === 0) {
      return reply('❌ You need a dragon to explore! Use *%startdragon* first.');
    }

    // Check if current dragon is alive
    const activeDragon = player.dragons[0];
    if (activeDragon.hp <= 0) {
        return reply('❌ Your active dragon has fainted! Heal it before exploring.');
    }

    // Progression logic
    const monstersThisFloor = dungeon.monstersDefeated % dungeon.monstersPerFloor;

    let enemy;
    let isBoss = false;

    if (dungeon.currentFloor === dungeon.maxFloors && monstersThisFloor === 0 && dungeon.monstersDefeated > 0) {
        // Boss time!
        enemy = JSON.parse(JSON.stringify(dungeon.boss));
        isBoss = true;
        enemy.isBoss = true;
    } else {
        const monsterTemplate = DUNGEON_MONSTERS[Math.floor(Math.random() * DUNGEON_MONSTERS.length)];
        enemy = JSON.parse(JSON.stringify(monsterTemplate));

        const modifier = DIFFICULTY_MODIFIER[dungeon.difficulty] || 0;
        enemy.level = enemy.baseLevel + modifier + Math.floor(Math.random() * 3);

        // Scale stats
        const levelDiff = enemy.level - enemy.baseLevel;
        const scaleFactor = 1 + (levelDiff * 0.1);

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
      opponent: 'WILD',
      isDungeon: true,
      dungeonId: dungeon.id,
      activeDragonIndex: 0,
      wildDragon: enemy,
      turn: true
    };

    player.inBattle.active = true;
    await DB.saveDB('users');

    const title = isBoss ? `⚠️ *FLOOR ${dungeon.currentFloor} BOSS: ${enemy.name}* ⚠️` : `👾 *[Floor ${dungeon.currentFloor}] A Wild ${enemy.name} appears!*`;
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

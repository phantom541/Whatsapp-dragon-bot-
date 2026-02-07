import DB from '../../utils/database.js';
import { spawnDungeonFloor } from '../../system/dungeon_spawner.js';

export default {
  name: 'nextfloor',
  aliases: ['nf'],
  description: 'Advance to the next floor of the active dungeon.',
  execute: async ({ sender, reply, from }) => {
    const dungeonDb = await DB.getDB('dungeons');
    const dungeon = dungeonDb[from]?.find(d => d.status === 'active');

    if (!dungeon) return reply('🏰 No active dungeon in this group.');

    if (dungeon.monstersRemaining.length > 0)
      return reply(`❌ You must defeat all ${dungeon.monstersRemaining.length} monsters on this floor before advancing.`);

    if (dungeon.floorBoss)
      return reply(`❌ You must defeat the Floor Boss *${dungeon.floorBoss.name}* before advancing.`);

    dungeon.floor += 1;

    // Check if dungeon completed
    if (dungeon.floor > dungeon.maxFloors) {
      dungeon.status = 'completed';
      await DB.saveDB('dungeons');
      return reply(`🏆 *DUNGEON COMPLETED!* 🏆\nAll ${dungeon.maxFloors} floors have been cleared. You are a true legend!`);
    }

    // Spawn next floor monsters
    const { monsters, boss } = spawnDungeonFloor(dungeon.floor, dungeon.difficulty);

    dungeon.monstersRemaining = monsters;
    dungeon.floorBoss = boss;

    await DB.saveDB('dungeons');

    reply(`➡️ *Floor ${dungeon.floor}* spawned with ${monsters.length} monsters.\n💀 Boss: *${boss.name}* (${boss.title})\nGood luck!`);
  }
};

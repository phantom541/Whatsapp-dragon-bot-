import { spawnDungeon, getActiveDungeon } from "../../system/dungeon_spawner.js";

export default {
  name: "dungeon",
  description: "Check dungeon status or spawn a new one (Admin)",
  execute: async ({ sender, reply, args, from, hasRole, sock }) => {
    const sub = args[0]?.toLowerCase();

    if (sub === 'spawn') {
      if (!hasRole('owner') && !hasRole('admin')) {
        return reply('❌ Only admins can manually spawn dungeons.');
      }

      const dungeon = await spawnDungeon(from);

      const caption = `🏰 *A NEW DUNGEON HAS OPENED!* 🏰\n\n` +
        `📈 *Difficulty:* ${dungeon.difficulty.toUpperCase()}\n` +
        `🏢 *Floors:* ${dungeon.maxFloors}\n\n` +
        `👾 *Floor 1 Monsters:* ${dungeon.monstersRemaining.length}\n` +
        `💀 *Floor 1 Boss:* ${dungeon.floorBoss.name} (${dungeon.floorBoss.title})\n\n` +
        `Use *%attackmonster* to start the fight!`;

      if (dungeon.floorBoss.image) {
        await sock.sendMessage(from, { image: { url: dungeon.floorBoss.image }, caption });
      } else {
        reply(caption);
      }
      return;
    }

    const dungeon = await getActiveDungeon(from);
    if (!dungeon) {
      return reply('🏰 No active dungeon in this group. Use *%dungeon spawn* (Admin) to start one.');
    }

    const monstersList = dungeon.monstersRemaining.map((m, i) => `${i+1}. ${m.name} (HP: ${m.currentHp})`).join('\n');
    const bossInfo = dungeon.floorBoss ? `💀 *Boss:* ${dungeon.floorBoss.name} (HP: ${dungeon.floorBoss.currentHp})` : `✅ Boss defeated!`;

    const info = `🏰 *DUNGEON STATUS* 🏰\n\n` +
      `🏢 *Current Floor:* ${dungeon.floor}/${dungeon.maxFloors}\n` +
      `📈 *Difficulty:* ${dungeon.difficulty.toUpperCase()}\n\n` +
      `👾 *Monsters Remaining:* ${dungeon.monstersRemaining.length}\n${monstersList}\n\n` +
      `${bossInfo}\n\n` +
      `⚔️ Use *%attackmonster* or *%attackboss*!`;

    reply(info);
  }
};

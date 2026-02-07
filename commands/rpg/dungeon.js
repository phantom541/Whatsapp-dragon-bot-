import { spawnDungeon, getActiveDungeon } from "../../system/dungeon_spawner.js";

export default {
  name: "dungeon",
  description: "Check for active dungeons or spawn one (Admin)",
  execute: async ({ sender, reply, args, from, hasRole, sock }) => {
    const sub = args[0]?.toLowerCase();

    if (sub === 'spawn') {
      if (!hasRole('owner') && !hasRole('admin')) {
        return reply('❌ Only admins can manually spawn dungeons.');
      }

      const result = await spawnDungeon(from);
      if (result.error) {
        return reply(`❌ ${result.error}`);
      }

      const boss = result.boss;
      const caption = `🏰 *A NEW DUNGEON HAS OPENED!* 🏰\n\n` +
        `📜 *Title:* ${boss.title}\n` +
        `💀 *Boss:* ${boss.name}\n` +
        `📈 *Difficulty:* ${result.difficulty.toUpperCase()}\n\n` +
        `Use *%explore* to enter the dungeon!`;

      if (boss.image) {
        await sock.sendMessage(from, { image: { url: boss.image }, caption });
      } else {
        reply(caption);
      }
      return;
    }

    const dungeon = await getActiveDungeon(from);
    if (!dungeon) {
      return reply('🏰 No active dungeon in this group. Use *%dungeon spawn* (Admin) to start one.');
    }

    const boss = dungeon.boss;
    const info = `🏰 *ACTIVE DUNGEON* 🏰\n\n` +
      `📜 *Title:* ${boss.title}\n` +
      `💀 *Boss:* ${boss.name} (Lv ${boss.level})\n` +
      `📈 *Difficulty:* ${dungeon.difficulty.toUpperCase()}\n` +
      `🏢 *Floors:* ${dungeon.currentFloor}/${dungeon.maxFloors}\n` +
      `⚔️ *Monsters Defeated:* ${dungeon.monstersDefeated}\n\n` +
      `Use *%explore* to progress!`;

    reply(info);
  }
};

import { spawnDragon } from '../../system/spawner.js';

export default {
  name: 'spawn',
  description: 'Spawn a wild dragon in the group (mods/owner only)',
  execute: async ({ sock, from, sender, hasRole, reply }) => {
    // Only owner/mod can trigger wild spawns
    if (!hasRole('mod')) {
      return reply('❌ Only Owner or Moderator can spawn a dragon.');
    }

    const result = await spawnDragon(sock, from, sender);
    if (!result) {
        return reply('❌ Failed to spawn dragon. Make sure dragons are loaded.');
    }
  }
};

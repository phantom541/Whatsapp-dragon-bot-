import { spawnDragon } from '../../system/spawner.js';
import { hasRole } from '../../utils/helpers.js';

export default {
  name: 'spawn',
  description: 'Spawn a wild dragon in the group (mods/owner only)',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // Only owner/mod can trigger wild spawns
    if (!await hasRole(sender, 'mod')) {
      return sock.sendMessage(from, { text: '❌ Only Owner or Moderator can spawn a dragon.' });
    }

    const result = await spawnDragon(sock, from, sender);
    if (!result) {
        return sock.sendMessage(from, { text: '❌ Failed to spawn dragon. Make sure dragons are loaded.' });
    }
  }
};

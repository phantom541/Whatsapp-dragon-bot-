import DB from '../../utils/database.js';
import { isOwner, isMod } from '../../utils/helpers.js';

export default {
  name: 'wild',
  description: 'Enable or disable wild dragon spawns in this group (mod/owner only)',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const sub = (args[0] || '').toLowerCase();

    if (!['on', 'off'].includes(sub)) return sock.sendMessage(from, { text: 'Usage: %wild on/off' });

    if (!await isOwner(sender) && !await isMod(sender, from)) {
      return sock.sendMessage(from, { text: '❌ Only Owner/Mod can toggle wild dragons.' });
    }

    const db = await DB.getDB('users');
    db.groups = db.groups || {};
    db.groups[from] = db.groups[from] || {};
    db.groups[from].wildDragonsOn = sub === 'on';
    await DB.saveDB('users');

    return sock.sendMessage(from, { text: sub === 'on' ? '✅ Wild dragons ENABLED' : '🚫 Wild dragons DISABLED' });
  }
};

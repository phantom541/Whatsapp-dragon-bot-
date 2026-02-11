import DB from '../../utils/database.js';

export default {
  name: 'wild',
  description: 'Enable or disable wild dragon spawns in this group (mod/owner only)',
  execute: async ({ sender, from, args, reply, hasRole }) => {
    const sub = (args[0] || '').toLowerCase();

    if (!['on', 'off'].includes(sub)) return reply('Usage: =wild on/off');

    if (!hasRole('mod') && !hasRole('owner')) {
      return reply('❌ Only Owner/Mod can toggle wild dragons.');
    }

    const db = await DB.getDB('users');
    db.groups = db.groups || {};
    db.groups[from] = db.groups[from] || {};
    db.groups[from].wildDragonsOn = sub === 'on';
    await DB.saveDB('users');

    return reply(sub === 'on' ? '✅ Wild dragon spawns ENABLED in this group.' : '🚫 Wild dragon spawns DISABLED in this group.');
  }
};

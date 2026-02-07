import DB from '../../utils/database.js';

export default {
  name: 'wildtoggle',
  description: 'Enable or disable wild dragon spawns globally (owner/mod only)',
  execute: async ({ reply, hasRole }) => {
    if (!hasRole('owner') && !hasRole('mod')) {
      return reply('❌ You lack authority.');
    }

    const db = await DB.getDB('users');
    db.system = db.system || {};
    db.system.wildEnabled = !db.system.wildEnabled;

    await DB.saveDB('users');
    reply(`🐉 Wild dragons are now *${db.system.wildEnabled ? 'ENABLED' : 'DISABLED'}*`);
  }
};

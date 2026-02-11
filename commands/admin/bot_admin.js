import DB from '../../utils/database.js';

export default {
  name: 'botadmin',
  description: 'Owner god mode: tweak anything in the bot',
  execute: async ({ sender, args, reply, hasRole, from }) => {
    // Only owner
    if (!hasRole('owner')) {
      return reply('❌ Only the primary owner can use this.');
    }

    if (args.length < 1) {
      return reply('Available subcommands:\n- =botadmin get <category> <id>\n- =botadmin setuser <jid> <field> <value>\n- =botadmin setdragon <id> <field> <value>\n- =botadmin setbot <field> <value>\n- =botadmin reset <category>');
    }

    const sub = args[0].toLowerCase();

    switch(sub) {
      case 'get': {
        const category = args[1]?.toLowerCase();
        const id = args[2];
        if (!category || !id) return reply('Usage: =botadmin get <user|dragon|spawn> <id>');

        let dbName = category === 'dragon' ? 'dragons' : category === 'user' ? 'users' : category === 'spawn' ? 'spawns' : null;
        if (!dbName) return reply('❌ Invalid category');

        const db = await DB.getDB(dbName);
        let target = category === 'dragon' ? db.dragons?.[id] : category === 'user' ? db.users?.[id] : db.spawns?.[from]?.[id];

        if (!target) return reply(`❌ ${category} ${id} not found`);
        return reply(`📋 ${category} ${id}:\n\`\`\`json\n${JSON.stringify(target, null, 2)}\n\`\`\``);
      }

      case 'setuser': {
        const jid = args[1];
        const field = args[2];
        const value = args.slice(3).join(' ');
        if (!jid || !field) return reply('Usage: =botadmin setuser <jid> <field> <value>');

        const db = await DB.getDB('users');
        if (!db.users[jid]) return reply(`❌ User ${jid} not found`);

        db.users[jid][field] = (!isNaN(Number(value)) && value.trim() !== '') ? Number(value) : value;
        await DB.saveDB('users');
        return reply(`✅ Set ${field} of ${jid} to ${value}`);
      }

      case 'setdragon': {
        const id = args[1];
        const field = args[2];
        const value = args.slice(3).join(' ');
        if (!id || !field) return reply('Usage: =botadmin setdragon <id> <field> <value>');

        const db = await DB.getDB('dragons');
        if (!db.dragons[id]) return reply(`❌ Dragon ${id} not found`);

        db.dragons[id][field] = (!isNaN(Number(value)) && value.trim() !== '') ? Number(value) : value;
        await DB.saveDB('dragons');
        return reply(`✅ Dragon ${id} updated: ${field} = ${value}`);
      }

      case 'setbot': {
        const field = args[1];
        const value = args.slice(2).join(' ');
        if (!field) return reply('Usage: =botadmin setbot <field> <value>');

        const db = await DB.getDB('users');
        db[field] = (!isNaN(Number(value)) && value.trim() !== '') ? Number(value) : value;
        await DB.saveDB('users');
        return reply(`✅ Bot field ${field} set to ${value}`);
      }

      case 'reset': {
        const category = args[1]?.toLowerCase();
        if (!category) return reply('Usage: =botadmin reset <users|dragons|spawns>');

        if (['users', 'dragons', 'spawns'].includes(category)) {
            const db = await DB.getDB(category);
            if (category === 'users') db.users = {};
            else if (category === 'dragons') db.dragons = {};
            else if (category === 'spawns') db.spawns = {};
            await DB.saveDB(category);
            return reply(`✅ ${category} reset successfully`);
        }
        return reply('❌ Invalid category');
      }

      default:
        return reply('❌ Unknown action.');
    }
  }
};

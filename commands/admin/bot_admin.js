import DB from '../../utils/database.js';
import { isOwner } from '../../utils/helpers.js';

export default {
  name: 'botadmin',
  description: 'Owner god mode: tweak anything in the bot',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // Only owner
    if (!await isOwner(sender)) {
      return sock.sendMessage(from, { text: '❌ Only the primary owner can use this.' });
    }

    if (args.length < 1) {
      return sock.sendMessage(from, {
        text: 'Available subcommands:\n- %botadmin get <category> <id>\n- %botadmin setuser <jid> <field> <value>\n- %botadmin setdragon <id> <field> <value>\n- %botadmin setbot <field> <value>\n- %botadmin reset <category>'
      });
    }

    const sub = args[0].toLowerCase();

    switch(sub) {
      case 'get': {
        const category = args[1]?.toLowerCase();
        const id = args[2];
        if (!category || !id) return sock.sendMessage(from, { text: 'Usage: %botadmin get <user|dragon|spawn> <id>' });

        let dbName = category === 'dragon' ? 'dragons' : category === 'user' ? 'users' : category === 'spawn' ? 'spawns' : null;
        if (!dbName) return sock.sendMessage(from, { text: '❌ Invalid category' });

        const db = await DB.getDB(dbName);
        let target = category === 'dragon' ? db.dragons?.[id] : category === 'user' ? db.users?.[id] : db.spawns?.[from]?.[id];

        if (!target) return sock.sendMessage(from, { text: `❌ ${category} ${id} not found` });
        return sock.sendMessage(from, { text: `📋 ${category} ${id}:\n\`\`\`json\n${JSON.stringify(target, null, 2)}\n\`\`\`` });
      }

      case 'setuser': {
        const jid = args[1];
        const field = args[2];
        const value = args.slice(3).join(' ');
        if (!jid || !field) return sock.sendMessage(from, { text: 'Usage: %botadmin setuser <jid> <field> <value>' });

        const db = await DB.getDB('users');
        if (!db.users[jid]) return sock.sendMessage(from, { text: `❌ User ${jid} not found` });

        db.users[jid][field] = (!isNaN(Number(value)) && value.trim() !== '') ? Number(value) : value;
        await DB.saveDB('users');
        return sock.sendMessage(from, { text: `✅ Set ${field} of ${jid} to ${value}` });
      }

      case 'setdragon': {
        const id = args[1];
        const field = args[2];
        const value = args.slice(3).join(' ');
        if (!id || !field) return sock.sendMessage(from, { text: 'Usage: %botadmin setdragon <id> <field> <value>' });

        const db = await DB.getDB('dragons');
        if (!db.dragons[id]) return sock.sendMessage(from, { text: `❌ Dragon ${id} not found` });

        db.dragons[id][field] = (!isNaN(Number(value)) && value.trim() !== '') ? Number(value) : value;
        await DB.saveDB('dragons');
        return sock.sendMessage(from, { text: `✅ Dragon ${id} updated: ${field} = ${value}` });
      }

      case 'setbot': {
        const field = args[1];
        const value = args.slice(2).join(' ');
        if (!field) return sock.sendMessage(from, { text: 'Usage: %botadmin setbot <field> <value>' });

        // For now setbot can edit general fields in the users database (like group settings)
        const db = await DB.getDB('users');
        db[field] = (!isNaN(Number(value)) && value.trim() !== '') ? Number(value) : value;
        await DB.saveDB('users');
        return sock.sendMessage(from, { text: `✅ Bot field ${field} set to ${value}` });
      }

      case 'reset': {
        const category = args[1]?.toLowerCase();
        if (!category) return sock.sendMessage(from, { text: 'Usage: %botadmin reset <users|dragons|spawns>' });

        if (['users', 'dragons', 'spawns'].includes(category)) {
            const db = await DB.getDB(category);
            if (category === 'users') db.users = {};
            else if (category === 'dragons') db.dragons = {};
            else if (category === 'spawns') db.spawns = {};
            await DB.saveDB(category);
            return sock.sendMessage(from, { text: `✅ ${category} reset successfully` });
        }
        return sock.sendMessage(from, { text: '❌ Invalid category' });
      }

      default:
        return sock.sendMessage(from, { text: '❌ Unknown action.' });
    }
  }
};

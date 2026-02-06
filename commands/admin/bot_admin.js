import DB from '../../utils/database.js';
import { isOwner } from '../../utils/helpers.js';

export default {
  name: 'botadmin',
  description: 'Owner god mode: tweak anything in the bot',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // Only primary owner
    if (!await isOwner(sender)) {
      return sock.sendMessage(from, { text: '❌ Only owner can use this command.' });
    }

    if (args.length < 1) {
      return sock.sendMessage(from, { text: 'Usage:\n%botadmin <action> [category] [id] [field] [value]\n\nActions: set, get, reset\nCategories: dragon, user, spawn\nExample: %botadmin set user <jid> gold 1000000' });
    }

    const action = args[0].toLowerCase();

    // GET action: view any object
    if (action === 'get') {
      if (args.length < 3) {
        return sock.sendMessage(from, { text: 'Usage: %botadmin get <category> <id>\nCategories: dragon, user, spawn' });
      }
      const category = args[1].toLowerCase();
      const id = args[2];

      let dbName = category === 'dragon' ? 'dragons' : category === 'user' ? 'users' : category === 'spawn' ? 'spawns' : null;
      if (!dbName) return sock.sendMessage(from, { text: '❌ Invalid category' });

      const db = await DB.getDB(dbName);
      let target;
      if (category === 'dragon') target = db.dragons?.[id];
      else if (category === 'user') target = db.users?.[id];
      else if (category === 'spawn') {
          // Spawns are nested by groupId
          target = db.spawns?.[from]?.[id];
      }

      if (!target) {
        return sock.sendMessage(from, { text: `❌ ${category} ${id} not found` });
      }

      return sock.sendMessage(from, { text: `📋 ${category} ${id}:\n\`\`\`json\n${JSON.stringify(target, null, 2)}\n\`\`\`` });
    }

    // SET action: modify any field
    if (action === 'set') {
      if (args.length < 5) {
        return sock.sendMessage(from, { text: 'Usage: %botadmin set <category> <id> <field> <value>' });
      }

      const category = args[1].toLowerCase();
      const id = args[2];
      const field = args[3];
      const value = args.slice(4).join(' ');

      let dbName = category === 'dragon' ? 'dragons' : category === 'user' ? 'users' : category === 'spawn' ? 'spawns' : null;
      if (!dbName) return sock.sendMessage(from, { text: '❌ Invalid category' });

      const db = await DB.getDB(dbName);
      let target;
      if (category === 'dragon') target = db.dragons?.[id];
      else if (category === 'user') target = db.users?.[id];
      else if (category === 'spawn') target = db.spawns?.[from]?.[id];

      if (!target) return sock.sendMessage(from, { text: `❌ ${category} ${id} not found` });

      // Convert numeric fields automatically
      if (!isNaN(Number(value)) && value.trim() !== '') {
          target[field] = Number(value);
      } else {
          target[field] = value;
      }

      await DB.saveDB(dbName);

      return sock.sendMessage(from, { text: `✅ ${category} ${id} updated: ${field} = ${value}` });
    }

    // RESET action: wipe data in category
    if (action === 'reset') {
      if (args.length < 2) {
        return sock.sendMessage(from, { text: 'Usage: %botadmin reset <category>\nCategories: dragons, users, spawns' });
      }
      const category = args[1].toLowerCase();

      if (category === 'dragons') {
          const db = await DB.getDB('dragons');
          db.dragons = {};
          await DB.saveDB('dragons');
      } else if (category === 'users') {
          const db = await DB.getDB('users');
          db.users = {};
          await DB.saveDB('users');
      } else if (category === 'spawns') {
          const db = await DB.getDB('spawns');
          db.spawns = {};
          await DB.saveDB('spawns');
      } else {
          return sock.sendMessage(from, { text: '❌ Invalid category for reset' });
      }

      return sock.sendMessage(from, { text: `✅ ${category} reset successfully` });
    }

    return sock.sendMessage(from, { text: '❌ Unknown action. Allowed actions: get, set, reset' });
  }
};

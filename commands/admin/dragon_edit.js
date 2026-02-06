import DB from '../../utils/database.js';
import { isOwner } from '../../utils/helpers.js';

export default {
  name: 'dragonedit',
  description: 'Owner command: view/edit any dragon',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    // Check owner
    if (!await isOwner(sender)) {
      return sock.sendMessage(from, { text: '❌ Only owner can use this command.' });
    }

    if (args.length < 1) {
      return sock.sendMessage(from, { text: 'Usage:\n%dragonedit <dragonId> [field] [newValue]\n\nExample: %dragonedit d0001 level 50' });
    }

    const dragonId = args[0];
    const db = await DB.getDB('dragons');
    db.dragons = db.dragons || {};
    const dragon = db.dragons[dragonId];

    if (!dragon) {
      return sock.sendMessage(from, { text: '❌ Dragon not found.' });
    }

    // If no field provided, just show full dragon info
    if (args.length === 1) {
      const info =
`🛡️ *Dragon Info:*
ID: ${dragon.id}
Name: ${dragon.name}
Owner: ${dragon.owner || "None"}
Level: ${dragon.level}
HP: ${dragon.hp}
Attack: ${dragon.atk || 0}
Defense: ${dragon.def || 0}
Rarity: ${dragon.rarity || "Unknown"}
Element: ${dragon.element || "None"}
`;
      return sock.sendMessage(from, { text: info });
    }

    // Edit a field
    const field = args[1].toLowerCase();
    const value = args.slice(2).join(" ");

    // Adapt field names to my implementation (atk/def vs attack/defense)
    let targetField = field;
    if (field === 'attack') targetField = 'atk';
    if (field === 'defense') targetField = 'def';

    const allowedFields = ['name','level','hp','atk','def','rarity','element','owner'];
    const displayFields = ['name','level','hp','attack','defense','rarity','element','owner'];

    if (!allowedFields.includes(targetField) && !['attack', 'defense'].includes(field)) {
      return sock.sendMessage(from, { text: `❌ Invalid field. Allowed: ${displayFields.join(', ')}` });
    }

    // convert numeric fields
    if (['level','hp','atk','def'].includes(targetField)) {
      if (isNaN(Number(value))) {
        return sock.sendMessage(from, { text: '❌ Value must be a number.' });
      }
      dragon[targetField] = Number(value);
    } else {
      dragon[targetField] = value;
    }

    await DB.saveDB('dragons');

    return sock.sendMessage(from, { text: `✅ Dragon ${dragonId} updated. Field ${field} is now ${value}` });
  }
};

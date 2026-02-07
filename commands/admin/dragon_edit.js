import DB from '../../utils/database.js';

export default {
  name: 'dragonedit',
  description: 'Owner command: view/edit any dragon',
  execute: async ({ sender, args, reply, hasRole }) => {
    // Check owner
    if (!hasRole('owner')) {
      return reply('❌ Only owner can use this command.');
    }

    if (args.length < 1) {
      return reply('Usage:\n%dragonedit <dragonId> [field] [newValue]\n\nExample: %dragonedit d0001 level 50');
    }

    const dragonId = args[0];
    const db = await DB.getDB('dragons');
    db.dragons = db.dragons || {};
    const dragon = db.dragons[dragonId];

    if (!dragon) {
      return reply('❌ Dragon not found.');
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
Element: ${dragon.type || "None"}
`;
      return reply(info);
    }

    // Edit a field
    const field = args[1].toLowerCase();
    const value = args.slice(2).join(" ");

    // Adapt field names to my implementation (atk/def vs attack/defense)
    let targetField = field;
    if (field === 'attack') targetField = 'atk';
    if (field === 'defense') targetField = 'def';

    const allowedFields = ['name','level','hp','atk','def','rarity','type','owner'];

    if (!allowedFields.includes(targetField)) {
      return reply(`❌ Invalid field. Allowed: ${allowedFields.join(', ')}`);
    }

    // convert numeric fields
    if (['level','hp','atk','def'].includes(targetField)) {
      if (isNaN(Number(value))) {
        return reply('❌ Value must be a number.');
      }
      dragon[targetField] = Number(value);
    } else {
      dragon[targetField] = value;
    }

    await DB.saveDB('dragons');

    // Sync with owner's collection if applicable
    if (dragon.owner) {
        const userDb = await DB.getDB('users');
        const user = userDb.users[dragon.owner];
        if (user && user.dragons) {
            const idx = user.dragons.findIndex(d => d.id === dragonId);
            if (idx !== -1) {
                user.dragons[idx] = { ...dragon };
                await DB.saveDB('users');
            }
        }
    }

    return reply(`✅ Dragon ${dragonId} updated. Field ${field} is now ${value}`);
  }
};

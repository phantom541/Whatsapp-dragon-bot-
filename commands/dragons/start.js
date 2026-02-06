import { getUser } from '../../utils/economy.js';
import { createDragon } from '../../utils/dragons.js';
import { STARTER_DRAGONS } from '../../data/dragon_templates.js';
import { getUserJid, getDisplayName } from '../../utils/player.js';
import DB from '../../utils/database.js';

export default {
  name: 'startdragon',
  description: 'Claim your first dragon',

  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);
    const pushName = getDisplayName(msg);

    const user = await getUser(jid, pushName);

    if (user.dragons && user.dragons.length > 0) {
      return sock.sendMessage(from, { text: '🐉 You already have a dragon.' });
    }

    const starter = STARTER_DRAGONS[
      Math.floor(Math.random() * STARTER_DRAGONS.length)
    ];

    const dragon = await createDragon(starter, jid);

    user.dragons = user.dragons || [];
    user.dragons.push(dragon.id);
    await DB.saveDB('users');

    await sock.sendMessage(from, {
      text:
`🐲 *Your Dragon Has Awakened!*

Name: ${dragon.name}
Type: ${dragon.type}
Level: 1
Rarity: Common`
    });
  }
};

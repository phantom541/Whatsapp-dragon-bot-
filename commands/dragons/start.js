import { getUser } from '../../utils/economy.js';
import { createDragon } from '../../utils/dragons.js';
import { STARTER_DRAGONS } from '../../data/dragon_templates.js';
import { getUserJid, getDisplayName } from '../../utils/player.js';
import DB from '../../utils/database.js';

export default {
  name: 'startdragon',
  description: 'Claim your first dragon',

  execute: async ({ sender, reply, getPlayer, updatePlayer }) => {
    const player = getPlayer(sender);

    if (player.dragons && player.dragons.length > 0) {
      return reply('🐉 You already have a dragon.');
    }

    const starter = STARTER_DRAGONS[
      Math.floor(Math.random() * STARTER_DRAGONS.length)
    ];

    const dragon = await createDragon(starter, sender);

    player.dragons = player.dragons || [];
    player.dragons.push(dragon); // Push full dragon object

    await updatePlayer(player);

    reply(
`🐲 *Your Dragon Has Awakened!*

Name: ${dragon.name}
Type: ${dragon.type}
Level: 1
Rarity: Common`
    );
  }
};

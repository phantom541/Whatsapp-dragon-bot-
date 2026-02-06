import DB from '../../utils/database.js';
import { getUserJid } from '../../utils/player.js';
import { getUser } from '../../utils/economy.js';

export default {
  name: 'heal',
  description: 'Heal your dragons (restore HP and PP)',
  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);

    const user = await getUser(jid);
    if (user.inBattle?.active) {
        return sock.sendMessage(from, { text: '❌ Cannot heal while in battle!' });
    }

    const dragonIds = user.dragons || [];
    if (dragonIds.length === 0) {
        return sock.sendMessage(from, { text: '❌ You have no dragons to heal.' });
    }

    const dragDb = await DB.getDB('dragons');
    let healedCount = 0;

    dragonIds.forEach(id => {
        const dragon = dragDb.dragons?.[id];
        if (dragon) {
            dragon.hp = dragon.maxHp || 50;
            dragon.pp = dragon.maxPp || 20;
            healedCount++;
        }
    });

    if (healedCount > 0) {
        await DB.saveDB('dragons');
        return sock.sendMessage(from, { text: `✨ ${healedCount} dragon(s) have been fully healed! HP and PP restored.` });
    } else {
        return sock.sendMessage(from, { text: '❌ No valid dragons found to heal.' });
    }
  }
};

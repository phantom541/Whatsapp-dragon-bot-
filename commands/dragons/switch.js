import DB from '../../utils/database.js';

export default {
  name: 'switch',
  description: 'Switch your active dragon mid-battle',
  execute: async ({ sender, args, reply, getPlayer }) => {
    const index = parseInt(args[0], 10) - 1;
    if (isNaN(index)) return reply('Usage: %switch <dragon number>');

    const usersDb = await DB.getDB('users');
    const session = usersDb.sessions?.[sender];
    const player = getPlayer(sender);

    if (!session?.inBattle) return reply('❌ You are not in a battle.');
    if (!session.turn) return reply('❌ Not your turn.');

    const dragon = player.dragons[index];
    if (!dragon) return reply('❌ Invalid dragon number.');
    if (dragon.hp <= 0) return reply('❌ That dragon has fainted!');
    if (session.activeDragonIndex === index) return reply('❌ That dragon is already active!');

    session.activeDragonIndex = index;

    if (session.opponent !== 'WILD') {
        const oppSession = usersDb.sessions[session.opponent];
        session.turn = false;
        oppSession.turn = true;
        await DB.saveDB('users');
        reply(`🔁 Switched to *${dragon.name}*. It is now the opponent's turn.`);
    } else {
        await DB.saveDB('users');
        reply(`🔁 Switched to *${dragon.name}*`);
    }
  }
};

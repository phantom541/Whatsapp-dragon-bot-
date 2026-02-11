import DB from '../../utils/database.js';
import { getRandomDragon, formatDragonInfo } from '../../utils/dragons.js';

export default {
  name: 'wild',
  description: 'Encounter and fight a wild dragon (PvE)',
  execute: async ({ sender, reply, sock, from, getPlayer }) => {
    const db = await DB.getDB('users');

    if (!db.system?.wildEnabled) {
      return reply('🌫️ The wilds are silent. Wild battles are currently disabled.');
    }

    const usersDb = await DB.getDB('users');
    if (usersDb.sessions?.[sender]?.inBattle) {
      return reply('❌ You are already in a battle.');
    }

    const wild = structuredClone(getRandomDragon());
    if (!wild) return reply('❌ No dragons found in database.');

    wild.isWild = true;
    // Ensure stats are scaled for the encounter
    const { scaleStats } = await import('../../utils/dragon_stats.js');
    scaleStats(wild);

    usersDb.sessions = usersDb.sessions || {};
    usersDb.sessions[sender] = {
      inBattle: true,
      opponent: 'WILD',
      activeDragonIndex: 0,
      wildDragon: wild,
      turn: true
    };

    const player = getPlayer(sender);
    player.inBattle.active = true;

    await DB.saveDB('users');

    const encounterMsg = `🌲 *A wild dragon appears!* 🌲\n\n` +
      `${formatDragonInfo(wild)}\n\n` +
      `Use *=attack <move>* to engage!`;

    if (wild.image) {
      await sock.sendMessage(from, { image: { url: wild.image }, caption: encounterMsg });
    } else {
      reply(encounterMsg);
    }
  }
};

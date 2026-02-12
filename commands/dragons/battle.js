import DB from '../../utils/database.js';
import { formatDragonInfo } from '../../utils/dragons.js';

const BATTLE_COOLDOWN = 60 * 1000; // 1 minute

export default {
  name: 'battle',
  description: 'Challenge another player to a turn-based dragon battle',
  execute: async ({ sender, reply, sock, from, msg, getPlayer }) => {
    const player = getPlayer(sender);
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!mentionedJid) return reply('❌ Please mention a player to battle.');
    if (sender === mentionedJid) return reply('❌ You cannot battle yourself!');

    const opponent = getPlayer(mentionedJid);
    if (!opponent?.name || opponent.name === 'Unknown') {
        return reply('❌ Target player not found or hasn\'t registered yet.');
    }

    if (!player.dragons?.length || !opponent.dragons?.length) {
      return reply('❌ Both players need at least 1 dragon.');
    }

    // Check cooldown
    const now = Date.now();
    if (now - (player.inBattle?.lastBattle || 0) < BATTLE_COOLDOWN) {
        const remaining = Math.ceil((BATTLE_COOLDOWN - (now - player.inBattle.lastBattle)) / 1000);
        return reply(`⚠️ You are still recovering! Wait ${remaining}s.`);
    }

    const userDb = await DB.getDB('users');
    userDb.sessions = userDb.sessions || {};

    if (userDb.sessions[sender]?.inBattle || userDb.sessions[mentionedJid]?.inBattle) {
      return reply('❌ Either you or the opponent is already in a battle.');
    }

    // Initialize battle session
    userDb.sessions[sender] = {
      inBattle: true,
      opponent: mentionedJid,
      activeDragonIndex: 0,
      turn: true,
      battleLog: []
    };
    userDb.sessions[mentionedJid] = {
      inBattle: true,
      opponent: sender,
      activeDragonIndex: 0,
      turn: false,
      battleLog: []
    };

    player.inBattle.active = true;
    player.inBattle.lastBattle = now;
    opponent.inBattle.active = true;
    opponent.inBattle.lastBattle = now;

    await DB.saveDB('users');

    const myDragon = player.dragons[0];
    const oppDragon = opponent.dragons[0];

    await sock.sendMessage(from, {
      text: `⚔️ *Battle Started!* ⚔️\n\n` +
            `*${player.name}* vs *${opponent.name}*\n\n` +
            `Your Active: ${myDragon.name} (Lvl ${myDragon.level})\n` +
            `Opponent Active: ${oppDragon.name} (Lvl ${oppDragon.level})\n\n` +
            `Use *=attack <move>* to fight or *=switch <index>* to change dragons!`
    });
  }
};

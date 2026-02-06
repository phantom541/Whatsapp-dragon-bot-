import DB from '../../utils/database.js';
import { getUserJid } from '../../utils/player.js';
import { getUser } from '../../utils/economy.js';
import { formatDragonInfo } from '../../utils/dragons.js';

const BATTLE_COOLDOWN = 60 * 1000; // 1 minute

export default {
  name: 'battle',
  description: 'Challenge another player to a dragon battle',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = getUserJid(msg);

    // Extract opponent mention
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) return sock.sendMessage(from, { text: '❌ Please mention a player to battle.' });

    if (sender === mentionedJid) {
        return sock.sendMessage(from, { text: '❌ You cannot battle yourself!' });
    }

    const player = await getUser(sender);
    const opponent = await getUser(mentionedJid);

    if (!player.dragons || player.dragons.length === 0) {
        return sock.sendMessage(from, { text: '❌ You do not have any dragons to battle with.' });
    }
    if (!opponent.dragons || opponent.dragons.length === 0) {
        return sock.sendMessage(from, { text: '❌ The opponent has no dragons to battle with.' });
    }

    // Check cooldown
    const now = Date.now();
    if (now - (player.inBattle?.lastBattle || 0) < BATTLE_COOLDOWN) {
        const remaining = Math.ceil((BATTLE_COOLDOWN - (now - player.inBattle.lastBattle)) / 1000);
        return sock.sendMessage(from, { text: `⚠️ You are still recovering! Wait ${remaining}s.` });
    }

    // Check if players are already in battle
    const usersDb = await DB.getDB('users');
    usersDb.sessions = usersDb.sessions || {};

    if (usersDb.sessions[sender]?.inBattle || usersDb.sessions[mentionedJid]?.inBattle) {
      return sock.sendMessage(from, { text: '❌ Either you or your opponent is already in a battle.' });
    }

    // Use companion or first dragon
    const myDragon = player.dragons.find(d => d.name === player.companion) || player.dragons[0];
    const oppDragon = opponent.dragons.find(d => d.name === opponent.companion) || opponent.dragons[0];

    // Initialize battle session
    usersDb.sessions[sender] = {
        inBattle: true,
        opponent: mentionedJid,
        myDragonIndex: player.dragons.indexOf(myDragon),
        oppDragonIndex: opponent.dragons.indexOf(oppDragon)
    };
    usersDb.sessions[mentionedJid] = {
        inBattle: true,
        opponent: sender,
        myDragonIndex: opponent.dragons.indexOf(oppDragon),
        oppDragonIndex: player.dragons.indexOf(myDragon)
    };

    player.inBattle.active = true;
    player.inBattle.lastBattle = now;
    opponent.inBattle.active = true;
    opponent.inBattle.lastBattle = now;

    await DB.saveDB('users');

    await sock.sendMessage(from, {
      text: `⚔️ *Battle Started!* ⚔️\n\n*${player.name}* vs *${opponent.name}*\n\n` +
            `Your Dragon: ${myDragon.name} (Lvl ${myDragon.level})\n` +
            `Opponent: ${oppDragon.name} (Lvl ${oppDragon.level})\n\n` +
            `Use *%attack <move>* to fight!`
    });
  }
};

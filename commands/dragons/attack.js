import DB from '../../utils/database.js';
import { getUserJid } from '../../utils/player.js';
import { addXP } from '../../utils/economy.js';

export default {
  name: 'attack',
  description: 'Attack your opponent in an ongoing battle',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = getUserJid(msg);
    const moveName = args.join(' ').trim();

    if (!moveName) return sock.sendMessage(from, { text: 'Usage: %attack <move name>' });

    const usersDb = await DB.getDB('users');
    const session = usersDb.sessions?.[sender];

    if (!session?.inBattle) return sock.sendMessage(from, { text: '❌ You are not currently in a battle.' });

    const opponentJid = session.opponent;
    const opponentSession = usersDb.sessions[opponentJid];

    const player = usersDb.users[sender];
    const opponent = usersDb.users[opponentJid];

    const myDragon = player.dragons[session.myDragonIndex];
    const oppDragon = opponent.dragons[session.oppDragonIndex];

    const move = myDragon.moves.find(m => (typeof m === 'string' ? m : m.name).toLowerCase() === moveName.toLowerCase());
    if (!move) return sock.sendMessage(from, { text: '❌ Your dragon does not know this move.' });

    const movePower = typeof move === 'string' ? 40 : (move.power || 40);
    const moveCost = typeof move === 'string' ? 4 : (move.cost || 4);

    if (myDragon.pp < moveCost) return sock.sendMessage(from, { text: '❌ Not enough PP!' });

    // damage calculation
    const damage = Math.floor(movePower * (0.8 + Math.random() * 0.4)) - (oppDragon.def || 5);
    const finalDamage = Math.max(5, damage);

    oppDragon.hp = Math.max(0, (oppDragon.hp || 50) - finalDamage);
    myDragon.pp -= moveCost;

    let resultText = `🔥 *${myDragon.name}* used *${typeof move === 'string' ? move : move.name}*!\n` +
                     `It dealt *${finalDamage}* damage to *${oppDragon.name}*.\n\n` +
                     `*${oppDragon.name}* HP: ${oppDragon.hp}`;

    if (oppDragon.hp <= 0) {
      resultText += `\n\n💥 *${oppDragon.name}* fainted!\n🏆 *${player.name}* wins the battle!`;

      // End battle
      usersDb.sessions[sender] = { inBattle: false };
      usersDb.sessions[opponentJid] = { inBattle: false };
      player.inBattle.active = false;
      opponent.inBattle.active = false;

      // Reward XP
      const xpResult = await addXP(sender, 100);
      resultText += `\n🎏 *XP Gained:* 100`;
      if (xpResult.rankedUp) resultText += `\n🏮 *New Rank:* ${xpResult.newRank}`;

      // Dragon Leveling (Simplified for now)
      myDragon.exp = (myDragon.exp || 0) + 50;
      if (myDragon.exp >= (myDragon.level * 100)) {
          myDragon.level++;
          myDragon.maxHp += 10;
          myDragon.hp = myDragon.maxHp;
          resultText += `\n🌟 *${myDragon.name}* leveled up to ${myDragon.level}!`;
      }
    }

    await DB.saveDB('users');
    await sock.sendMessage(from, { text: resultText });
  }
};

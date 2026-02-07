import DB from '../../utils/database.js';
import { addXP } from '../../utils/economy.js';
import { grantDragonXP } from '../../utils/dragon_xp.js';

const ELEMENT_ADVANTAGE = {
  FIRE: { strong: 'GRASS', weak: 'WATER' },
  WATER: { strong: 'FIRE', weak: 'GRASS' },
  GRASS: { strong: 'WATER', weak: 'FIRE' },
  // Add more elements as they appear in the 100-dragon roster
  ELECTRIC: { strong: 'WATER', weak: 'EARTH' },
  ICE: { strong: 'AIR', weak: 'FIRE' },
  EARTH: { strong: 'ELECTRIC', weak: 'GRASS' },
  METAL: { strong: 'ICE', weak: 'FIRE' },
  DARK: { strong: 'LIGHT', weak: 'LIGHT' }
};

export default {
  name: 'attack',
  description: 'Attack the opponent in turn-based battle',
  execute: async ({ sender, args, reply, getPlayer, sock, from }) => {
    const moveName = args.join(' ').trim();
    if (!moveName) return reply('Usage: %attack <move name>');

    const usersDb = await DB.getDB('users');
    const session = usersDb.sessions?.[sender];

    if (!session?.inBattle) return reply('❌ You are not currently in a battle.');
    if (!session.turn) return reply('❌ It is not your turn.');

    const player = getPlayer(sender);
    const myDragon = player.dragons[session.activeDragonIndex];

    const move = myDragon.moves.find(m => (typeof m === 'string' ? m : m.name).toLowerCase() === moveName.toLowerCase());
    if (!move) return reply('❌ Your dragon does not know this move.');

    const movePower = typeof move === 'string' ? 40 : (move.power || 40);
    const moveCost = typeof move === 'string' ? 4 : (move.cost || 4);

    if (myDragon.pp < moveCost) return reply('❌ Not enough PP!');

    // Get Opponent
    let oppDragon;
    let opponent;
    let opponentJid = session.opponent;

    if (opponentJid === 'WILD') {
        oppDragon = session.wildDragon;
    } else {
        opponent = getPlayer(opponentJid);
        const oppSession = usersDb.sessions[opponentJid];
        oppDragon = opponent.dragons[oppSession.activeDragonIndex];
    }

    // Damage calculation
    let baseDamage = Math.floor(movePower * (0.8 + Math.random() * 0.4)) - (oppDragon.def || 5);
    baseDamage = Math.max(5, baseDamage);

    // Elemental multiplier
    const myType = (myDragon.type || 'FIRE').toUpperCase();
    const oppType = (oppDragon.type || 'FIRE').toUpperCase();
    let multiplier = 1;
    if (ELEMENT_ADVANTAGE[myType]?.strong === oppType) multiplier = 1.5;
    else if (ELEMENT_ADVANTAGE[myType]?.weak === oppType) multiplier = 0.7;

    const finalDamage = Math.floor(baseDamage * multiplier);
    oppDragon.hp = Math.max(0, (oppDragon.hp || 50) - finalDamage);
    myDragon.pp -= moveCost;

    let battleMsg = `🔥 *${myDragon.name}* used *${typeof move === 'string' ? move : move.name}*!\n` +
                    `It dealt *${finalDamage}* damage.\n` +
                    `*${oppDragon.name}* HP: ${oppDragon.hp}`;

    if (multiplier > 1) battleMsg += '\n✨ It\'s super effective!';
    else if (multiplier < 1) battleMsg += '\n💢 It\'s not very effective...';

    // Handle Faint
    if (oppDragon.hp <= 0) {
      battleMsg += `\n\n💥 *${oppDragon.name}* fainted!`;

      // Level up my dragon
      const leveled = grantDragonXP(myDragon, 100);
      if (leveled) battleMsg += `\n🌟 *${myDragon.name}* leveled up to ${myDragon.level}! Stats increased.`;

      if (opponentJid === 'WILD') {
          // End Wild Battle
          usersDb.sessions[sender] = { inBattle: false };
          player.inBattle.active = false;
          player.gold += 500;
          battleMsg += `\n\n🏆 You defeated the wild dragon!\n💰 +500 gold`;
      } else {
          // Check for next dragon
          const oppNextIndex = opponent.dragons.findIndex(d => d.hp > 0);
          if (oppNextIndex === -1) {
              // End PvP Battle
              battleMsg += `\n\n🏆 *${player.name}* wins the battle!`;
              usersDb.sessions[sender] = { inBattle: false };
              usersDb.sessions[opponentJid] = { inBattle: false };
              player.inBattle.active = false;
              opponent.inBattle.active = false;
              await addXP(sender, 200);
          } else {
              const oppSession = usersDb.sessions[opponentJid];
              oppSession.activeDragonIndex = oppNextIndex;
              battleMsg += `\n⚠️ *${opponent.name}* sent out *${opponent.dragons[oppNextIndex].name}*!`;
              oppSession.turn = true;
              session.turn = false;
          }
      }
    } else {
        // Switch turn
        if (opponentJid === 'WILD') {
            // AI Counterattack
            const aiDamage = Math.floor(Math.random() * 10) + 5;
            myDragon.hp = Math.max(0, (myDragon.hp || 50) - aiDamage);
            battleMsg += `\n\n🐲 Wild *${oppDragon.name}* strikes back for *${aiDamage}* damage!\n` +
                          `*${myDragon.name}* HP: ${myDragon.hp}`;

            if (myDragon.hp <= 0) {
                battleMsg += `\n\n💀 *${myDragon.name}* fainted.\nYou escaped, wounded.`;
                usersDb.sessions[sender] = { inBattle: false };
                player.inBattle.active = false;
            }
        } else {
            session.turn = false;
            usersDb.sessions[opponentJid].turn = true;
            battleMsg += `\n\n⏳ It is now *${opponent.name}*'s turn!`;
        }
    }

    await DB.saveDB('users');
    await DB.saveDB('dragons'); // Stats updated
    await sock.sendMessage(from, { text: battleMsg });
  }
};

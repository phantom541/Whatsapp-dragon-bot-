import { getPlayerProfile } from '../../utils/rpg_user_manager.js';
import axios from 'axios';

export default {
  name: 'fun',
  aliases: ['roll', 'coin', 'hug', 'poke', 'slap', 'highfive', 'meme', 'gif', 'dragonparty', 'playwithdragon', 'dragonstats', 'riddle', 'compliment'],
  description: 'All fun and interactive commands for players',
  async execute({ sock, msg, reply, sender, args }) {
    const body = msg.message?.conversation || '';
    const player = await getPlayerProfile(sender);

    // -------------------- Dice & Coin --------------------
    if (body.startsWith('=roll')) {
      const num = Math.floor(Math.random() * 100) + 1;
      return reply(`🎲 You rolled: ${num}`);
    }

    if (body.startsWith('=coin')) {
      const side = Math.random() < 0.5 ? 'Heads' : 'Tails';
      return reply(`🪙 Coin flip: ${side}`);
    }

    // -------------------- Social Interactions --------------------
    if (body.startsWith('=hug')) {
      const target = args[0] || 'yourself';
      return reply(`🤗 ${player.name} hugs ${target}!`);
    }

    if (body.startsWith('=poke')) {
      const target = args[0] || 'yourself';
      return reply(`👉 ${player.name} pokes ${target}!`);
    }

    if (body.startsWith('=slap')) {
      const target = args[0] || 'the air';
      return reply(`🖐️ ${player.name} slaps ${target}!`);
    }

    if (body.startsWith('=highfive')) {
      const target = args[0] || 'the air';
      return reply(`✋ ${player.name} high-fives ${target}!`);
    }

    // -------------------- Meme / Fun Media --------------------
    if (body.startsWith('=meme')) {
      try {
        const res = await axios.get('https://meme-api.com/gimme');
        const data = res.data;
        return reply(`😂 ${data.title}\n${data.url}`);
      } catch (err) {
        return reply('❌ Could not fetch a meme.');
      }
    }

    if (body.startsWith('=gif')) {
      const query = args.join(' ') || 'funny';
      return reply(`🎬 Here's a GIF search result for: ${query}\nhttps://giphy.com/search/${encodeURIComponent(query)}`);
    }

    // -------------------- Dragon Interaction --------------------
    if (body.startsWith('=dragonparty')) {
      const dragons = player.dragons || [];
      if (dragons.length === 0) return reply('❌ You have no dragons yet! Use =startdragon');
      const dragonNames = dragons.map(d => `${d.name} (Lvl ${d.level || 1})`).join('\n');
      return reply(`🐉 *Your Dragon Party:*\n\n${dragonNames}`);
    }

    if (body.startsWith('=playwithdragon')) {
      const dragons = player.dragons || [];
      if (dragons.length === 0) return reply('❌ No dragons to play with.');
      const dragon = dragons[0];
      dragon.mood = 'HAPPY';
      return reply(`🐲 You played with ${dragon.name}. Mood is now ${dragon.mood}!`);
    }

    if (body.startsWith('=dragonstats')) {
      const dragons = player.dragons || [];
      if (dragons.length === 0) return reply('❌ No dragons to check.');
      const dragon = dragons[0];
      const statsText = `❤️ HP: ${dragon.hp}/${dragon.maxHp || 50}\n⚔️ ATK: ${dragon.atk || 10}\n🛡️ DEF: ${dragon.def || 5}\n元素: ${dragon.type}`;
      return reply(`📊 *${dragon.name}'s Stats:*\n\n${statsText}`);
    }

    // -------------------- Random Fun --------------------
    if (body.startsWith('=riddle')) {
      const riddles = [
        { q: 'I speak without a mouth and hear without ears. What am I?', a: 'An echo' },
        { q: 'What has keys but can’t open locks?', a: 'A piano' },
        { q: 'What runs but never walks?', a: 'A river' }
      ];
      const choice = riddles[Math.floor(Math.random() * riddles.length)];
      return reply(`❓ *Riddle:*\n\n${choice.q}\n\n📝 *Answer:* ||${choice.a}||`);
    }

    if (body.startsWith('=compliment')) {
      const compliments = [
        'You have a brilliant mind!',
        'Your code is probably flawless!',
        'You bring smiles wherever you go!',
        'You’re unstoppable today!'
      ];
      const compliment = compliments[Math.floor(Math.random() * compliments.length)];
      return reply(`💖 ${compliment}`);
    }

    return reply('❌ Fun command not recognized.');
  }
};

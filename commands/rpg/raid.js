import { spawnColossalRaid, joinColossalRaid, getActiveRaid, damageColossalBeast } from "../../system/colossal_raid.js";
import DB from "../../utils/database.js";
import { TYPE_ADVANTAGE } from "../../data/type_advantage.js";

export default {
  name: "raid",
  description: "Colossal Beast Raid system",
  execute: async ({ sender, reply, args, from, hasRole, sock, getPlayer, updatePlayer }) => {
    const sub = args[0]?.toLowerCase();

    if (sub === 'spawn') {
      if (!hasRole('owner') && !hasRole('admin')) {
        return reply('❌ Only admins can manually spawn raids.');
      }

      const beast = await spawnColossalRaid(from);
      const caption = `🚨 *COLOSSAL BEAST ALERT!* 🚨\n\n` +
        `👾 *Name:* ${beast.name}\n` +
        `📈 *Level:* ${beast.level}\n` +
        `❤️ *HP:* ${beast.hp}/${beast.maxHp}\n` +
        `元素 *Type:* ${beast.type}\n\n` +
        `Use *%raid join* to participate in the raid!`;

      if (beast.image) {
        await sock.sendMessage(from, { image: { url: beast.image }, caption });
      } else {
        reply(caption);
      }
      return;
    }

    const raid = await getActiveRaid(from);
    if (!raid) {
      return reply('🏙️ No active Colossal Beast raid in this group.');
    }

    if (sub === 'join') {
      const res = await joinColossalRaid(from, sender);
      if (!res) return reply('❌ Failed to join raid.');
      return reply(`✅ You have joined the raid against *${raid.name}*!`);
    }

    if (sub === 'leave') {
      const db = await DB.getDB('raids');
      if (db[from]?.colossal) {
        db[from].colossal.participants = db[from].colossal.participants.filter(pid => pid !== sender);
        await DB.saveDB('raids');
        return reply('✅ You left the Colossal Beast raid.');
      }
      return reply('❌ No active raid found.');
    }

    if (sub === 'attack') {
      if (!raid.participants.includes(sender)) {
        return reply('❌ You must join the raid first! Use *%raid join*.');
      }

      const player = getPlayer(sender);
      const dragon = player.dragons[0]; // Use first dragon for now
      if (!dragon || dragon.hp <= 0) {
        return reply('❌ Your dragon is unable to fight! Heal it first.');
      }

      // Player attack
      const move = dragon.moves[Math.floor(Math.random() * dragon.moves.length)];
      const moveName = typeof move === 'string' ? move : move.name;

      // Base damage formula
      let damage = (dragon.atk || 10) * (Math.random() * 5 + 5);

      // Weakness multiplier
      const isWeak = raid.weaknesses.some(w => w.toLowerCase() === (dragon.type || "").toLowerCase());
      if (isWeak) damage *= 1.5;

      damage = Math.floor(Math.min(damage, raid.hp));

      const updatedRaid = await damageColossalBeast(from, sender, damage);

      let msg = `⚔️ *${dragon.name}* used *${moveName}* on *${raid.name}* dealing ${damage} damage.\n`;
      if (isWeak) msg += `✨ It's super effective!\n`;

      // Beast counterattack
      if (updatedRaid.hp > 0) {
        const beastMove = raid.moves[Math.floor(Math.random() * raid.moves.length)];
        let counterDamage = (raid.level / 2) * (Math.random() * 5 + 5);

        // Type advantage check for beast
        // Simplified: if beast type matches dragon weakness (not implemented fully, so let's use generic)
        counterDamage = Math.floor(Math.min(counterDamage, dragon.hp));

        dragon.hp -= counterDamage;
        if (dragon.hp < 0) dragon.hp = 0;

        await updatePlayer(player);

        msg += `🛡️ *${raid.name}* used *${beastMove}* on *${dragon.name}* dealing ${counterDamage} damage.\n`;
        msg += `💖 Dragon HP: ${dragon.hp} | Beast HP: ${updatedRaid.hp}/${raid.maxHp}`;
      }

      if (updatedRaid.defeated) {
          msg = `🏆 *${raid.name}* has been defeated!\nAll participants received rewards and the title: *${raid.raidReward.title}*`;

          // Distribute rewards
          for (const pJid of updatedRaid.participants) {
              const p = await getPlayer(pJid);
              if (p) {
                p.gold += raid.raidReward.gold;
                p.exp += raid.raidReward.xp;
                p.roles = p.roles || [];
                if (!p.roles.includes(raid.raidReward.title)) {
                    p.roles.push(raid.raidReward.title);
                }
                await updatePlayer(p);
              }
          }
      }

      return reply(msg);
    }

    // Default: Status
    const status = `👾 *RAID STATUS: ${raid.name}* 👾\n\n` +
      `❤️ *HP:* ${raid.hp}/${raid.maxHp}\n` +
      `📈 *Level:* ${raid.level}\n` +
      `👥 *Participants:* ${raid.participants.length}\n\n` +
      `Use *%raid attack* to deal damage!`;

    reply(status);
  }
};

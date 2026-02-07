import { spawnColossalRaid, joinColossalRaid, getActiveRaid, damageColossalBeast } from "../../system/colossal_raid.js";
import DB from "../../utils/database.js";

export default {
  name: "raid",
  description: "Colossal Beast Raid system",
  execute: async ({ sender, reply, args, from, hasRole, sock, getPlayer }) => {
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

    if (sub === 'attack') {
      if (!raid.participants.includes(sender)) {
        return reply('❌ You must join the raid first! Use *%raid join*.');
      }

      const player = getPlayer(sender);
      const dragon = player.dragons[0]; // Use first dragon for now
      if (!dragon || dragon.hp <= 0) {
        return reply('❌ Your dragon is unable to fight! Heal it first.');
      }

      // Simple damage based on dragon attack
      const moveName = args.slice(1).join(' ');
      let damage = Math.floor((dragon.atk || 10) * (0.5 + Math.random()));

      // Bonus if it matches weakness
      const isWeak = raid.weaknesses.some(w => w.toLowerCase() === (dragon.type || "").toLowerCase());
      if (isWeak) {
          damage = Math.floor(damage * 1.5);
      }

      const updatedRaid = await damageColossalBeast(from, sender, damage);

      let msg = `⚔️ *${dragon.name}* attacked *${raid.name}* for *${damage}* damage!`;
      if (isWeak) msg += `\n✨ It's super effective!`;

      msg += `\n❤️ *${raid.name}* HP: ${updatedRaid.hp}/${raid.maxHp}`;

      if (updatedRaid.defeated) {
          msg += `\n\n🏆 *COLOSSAL BEAST DEFEATED!* 🏆\nRewards have been distributed to all participants.`;
          // Distribute rewards logic...
          for (const pJid of updatedRaid.participants) {
              const p = getPlayer(pJid);
              p.gold += raid.raidReward.gold;
              p.exp += raid.raidReward.xp;
              // titles etc...
          }
          await DB.saveDB('users');
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

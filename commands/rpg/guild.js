import { createGuild, joinGuild, getPlayerGuild, leaveGuild, MAX_GUILD_SIZE } from '../../utils/guild_manager.js';
import { getPlayerProfile } from '../../utils/rpg_user_manager.js';
import { getGuildBuffs } from '../../utils/guild_buffs.js';

export default {
    name: 'guild',
    description: 'Manage or view guilds',
    async execute({ msg, reply, args, hasRole, sender }) {
        const player = await getPlayerProfile(sender);
        if(!player) return reply("❌ Player not found.");

        const isPrivileged = hasRole('owner') || hasRole('mod');
        const sub = args?.[0]?.toLowerCase();

        if(sub === "create") {
            const guildName = args[1];
            const desc = args.slice(2).join(" ");
            if(!guildName) return reply("Usage: =guild create <name> [description]");
            try {
                const guild = await createGuild(sender, guildName, desc, isPrivileged);
                reply(`✅ Guild "${guildName}" created successfully!\n👑 Leader: ${player.name}`);
            } catch(e) {
                reply(`❌ Error: ${e.message}`);
            }
        } else if(sub === "join") {
            const guildName = args[1];
            if(!guildName) return reply("Usage: =guild join <guildName>");
            try {
                const guild = await joinGuild(sender, guildName, isPrivileged);
                reply(`✅ You joined guild "${guildName}" successfully!`);
            } catch(e) {
                reply(`❌ Error: ${e.message}`);
            }
        } else if(sub === "leave") {
            try {
                const guild = await getPlayerGuild(sender);
                if (!guild) return reply("❌ You are not in a guild.");
                await leaveGuild(sender, isPrivileged);
                reply(`✅ You have left the guild.`);
            } catch(e) {
                reply(`❌ Error: ${e.message}`);
            }
        } else if(sub === "info") {
            const guild = await getPlayerGuild(sender);
            if(!guild) return reply("❌ You are not in a guild.");

            const buffs = getGuildBuffs(guild.level);
            let buffText = "None";
            const activeBuffs = [];
            if (buffs.hp) activeBuffs.push(`❤️ HP +${buffs.hp}`);
            if (buffs.attack) activeBuffs.push(`⚔️ ATK +${buffs.attack}`);
            if (buffs.xpBoost) activeBuffs.push(`✨ XP +${Math.round(buffs.xpBoost * 100)}%`);
            if (buffs.goldBoost) activeBuffs.push(`💰 Gold +${Math.round(buffs.goldBoost * 100)}%`);
            if (activeBuffs.length) buffText = activeBuffs.join("\n• ");

            const nextLevelXP = guild.level * 5000;

            reply(
                `🏰 *Guild: ${guild.name}*\n` +
                `👑 *Leader:* ${guild.leader.split('@')[0]}\n` +
                `⭐ *Level:* ${guild.level}\n` +
                `🔥 *XP:* ${guild.xp} / ${nextLevelXP}\n` +
                `👥 *Members:* ${guild.members.length} / ${MAX_GUILD_SIZE}\n` +
                `📈 *Requirement:* ${guild.rankRequirement}\n` +
                `🔖 *Description:* ${guild.description}\n\n` +
                `⚡ *Active Buffs:*\n• ${buffText}`
            );
        } else if (sub === "members") {
            const guild = await getPlayerGuild(sender);
            if(!guild) return reply("❌ You are not in a guild.");

            const list = guild.members.map((m, i) => `${i+1}. @${m.split('@')[0]}`).join('\n');
            reply(`👥 *Members of ${guild.name}:*\n\n${list}`);
        } else {
            reply(
                `🏰 *Guild Commands*\n\n` +
                `• *=guild create <name> <desc>* - Create a guild (High rank/Mod/Owner only)\n` +
                `• *=guild join <name>* - Join an existing guild\n` +
                `• *=guild leave* - Leave your current guild\n` +
                `• *=guild info* - View your guild details & buffs\n` +
                `• *=guild members* - List all guild members`
            );
        }
    }
};

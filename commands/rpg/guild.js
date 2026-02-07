import { createGuild, joinGuild, getPlayerGuild, leaveGuild } from '../../utils/guild_manager.js';
import { getPlayerProfile } from '../../utils/rpg_user_manager.js';

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
            if(!guildName) return reply("Usage: %guild create <name> [description]");
            try {
                const guild = await createGuild(sender, guildName, desc, isPrivileged);
                reply(`✅ Guild "${guildName}" created successfully!\n👑 Leader: ${player.name}`);
            } catch(e) {
                reply(`❌ Error: ${e.message}`);
            }
        } else if(sub === "join") {
            const guildName = args[1];
            if(!guildName) return reply("Usage: %guild join <guildName>");
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
            reply(
                `🏰 *Guild Info: ${guild.name}*\n\n` +
                `👑 *Leader:* ${guild.leader.split('@')[0]}\n` +
                `👥 *Members:* ${guild.members.length}\n` +
                `🔖 *Description:* ${guild.description}\n` +
                `📈 *Creation Rank:* ${guild.rankRequirement}`
            );
        } else {
            reply(
                `🏰 *Guild Commands*\n\n` +
                `• *%guild create <name> <desc>* - Create a guild (High rank/Mod/Owner only)\n` +
                `• *%guild join <name>* - Join an existing guild\n` +
                `• *%guild leave* - Leave your current guild\n` +
                `• *%guild info* - View your guild details`
            );
        }
    }
};

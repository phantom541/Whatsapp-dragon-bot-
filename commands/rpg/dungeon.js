import { runDungeonRaid, DUNGEONS } from '../../utils/dungeon_manager.js';
import { getPlayerProfile, updatePlayer } from '../../utils/rpg_user_manager.js';
import { getPlayerGuild, addGuildXP, updateGuild } from '../../utils/guild_manager.js';
import { canEnterDungeon, setDungeonCooldown, getRemainingCooldown } from '../../utils/guild_cooldowns.js';
import { applyGuildRewardsBuff } from '../../utils/guild_buffs.js';
import { checkLoneWolfAchievements } from '../../utils/title_manager.js';

export default {
    name: 'dungeon',
    description: 'Enter a dungeon raid',
    async execute({ msg, reply, sender, args, hasRole }) {
        const player = await getPlayerProfile(sender);
        if(!player) return reply("❌ Player profile not found.");

        const isPrivileged = hasRole('owner') || hasRole('mod');
        const guild = await getPlayerGuild(sender);

        // 🚫 Dungeon access rule
        if (!guild && !isPrivileged) {
          return reply(
            `🏰 *Guild Required*\n\n` +
            `You must belong to a guild to enter a dungeon.\n\n` +
            `Use:\n` +
            `• *%guild join <name>*\n` +
            `• *%guild create <name>*`
          );
        }

        // Pick a dungeon
        let dungeonName = args.join(" ").trim();

        if (!dungeonName) {
            dungeonName = DUNGEONS[Math.floor(Math.random() * DUNGEONS.length)].name;
        } else {
            const found = DUNGEONS.find(d => d.name.toLowerCase().includes(dungeonName.toLowerCase()));
            if (found) dungeonName = found.name;
            else return reply(`❌ Dungeon "${dungeonName}" not found.`);
        }

        const dungeon = DUNGEONS.find(d => d.name === dungeonName);

        // Cooldown check (per guild)
        if (guild && !isPrivileged) {
            if (!canEnterDungeon(guild, dungeon.difficulty)) {
                const remaining = getRemainingCooldown(guild, dungeon.difficulty);
                const mins = Math.ceil(remaining / 60000);
                return reply(`⏳ Your guild is still recovering. ${mins}m remaining for ${dungeon.difficulty.toUpperCase()} dungeons.`);
            }
        }

        try {
            // Apply cooldown
            if (guild && !isPrivileged) {
                setDungeonCooldown(guild, dungeon.difficulty);
            }

            const raidLog = await runDungeonRaid(sender, dungeonName);

            // Apply guild buffs to rewards
            const finalRewards = applyGuildRewardsBuff(guild, raidLog.rewards);

            // Re-fetch player since runDungeonRaid updates it
            const updatedPlayer = await getPlayerProfile(sender);

            // Adjust for buffs
            updatedPlayer.gold += (finalRewards.gold - raidLog.rewards.gold);
            updatedPlayer.exp += (finalRewards.xp - raidLog.rewards.xp);

            // Track solo clear for Lone Wolf
            if (!guild && isPrivileged) {
                updatedPlayer.stats = updatedPlayer.stats || {};
                updatedPlayer.stats.solo_dungeons = (updatedPlayer.stats.solo_dungeons || 0) + 1;
                checkLoneWolfAchievements(updatedPlayer);
            }

            await updatePlayer(updatedPlayer);

            // Give Guild XP and Stats
            if (guild) {
                const gXp = dungeon.floors * 250;
                await addGuildXP(guild.name, gXp);

                // Fetch fresh guild object to avoid stale stats if addGuildXP changed level
                const freshGuild = await getPlayerGuild(sender);
                freshGuild.stats = freshGuild.stats || { dungeonClears: 0, bossKills: 0 };
                freshGuild.stats.dungeonClears++;
                await updateGuild(freshGuild);
            }

            const monsterCount = raidLog.monstersDefeated.length;
            const bosses = raidLog.bossesDefeated.join(', ') || "None";

            let titleMsg = "";
            if(updatedPlayer.achievements && updatedPlayer.achievements.length){
                const relevantTitles = updatedPlayer.achievements.filter(t => !t.includes("Lone Wolf"));
                if (relevantTitles.length) {
                    titleMsg = `\n\n🏆 *Titles Earned:* ${relevantTitles.join(', ')}`;
                }
            }

            if (updatedPlayer.roles?.includes("🐺 Lone Wolf")) {
                titleMsg += `\n🐺 *Active Title:* 🐺 Lone Wolf`;
            }

            await reply(
                `🗡️ *Dungeon Raid Complete!* 🗡️\n\n` +
                `🏰 *Dungeon:* ${raidLog.dungeon}\n` +
                `📈 *Difficulty:* ${raidLog.difficulty.toUpperCase()}\n\n` +
                `👾 *Monsters Defeated:* ${monsterCount}\n` +
                `💀 *Boss Defeated:* ${bosses}\n\n` +
                `💰 *Gold:* ${finalRewards.gold}${guild ? ` (Buffed)` : ''}\n` +
                `✨ *XP:* ${finalRewards.xp}${guild ? ` (Buffed)` : ''}` +
                titleMsg
            );

        } catch(e) {
            console.error(e);
            reply(`❌ Error: ${e.message}`);
        }
    }
};

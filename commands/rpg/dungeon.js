import { runDungeonRaid, DUNGEONS } from '../../utils/dungeon_manager.js';
import { getPlayerProfile, updatePlayer } from '../../utils/rpg_user_manager.js';
import { getPlayerGuild, addGuildXP, updateGuild, canEnterDungeonCheck, recordGuildRace, getGuildLeaderboard } from '../../utils/guild_manager.js';
import { canEnterDungeon, setDungeonCooldown, getRemainingCooldown } from '../../utils/guild_cooldowns.js';
import { applyGuildRewardsBuff } from '../../utils/guild_buffs.js';
import { checkLoneWolfAchievements } from '../../utils/title_manager.js';

export default {
    name: 'dungeon',
    description: 'Enter a dungeon raid with your guild.',
    async execute({ msg, reply, sender, args, hasRole }) {
        const player = await getPlayerProfile(sender);
        if(!player) return reply("❌ Player profile not found.");

        const isPrivileged = hasRole('owner') || hasRole('mod');

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

        try {
            // ---------------- Guild & Eligibility Check ----------------
            await canEnterDungeonCheck(sender, dungeon.difficulty, isPrivileged);

            const guild = await getPlayerGuild(sender);

            // Cooldown check (per guild)
            if (guild && !isPrivileged) {
                if (!canEnterDungeon(guild, dungeon.difficulty)) {
                    const remaining = getRemainingCooldown(guild, dungeon.difficulty);
                    const mins = Math.ceil(remaining / 60000);
                    return reply(`⏳ Your guild is still recovering. ${mins}m remaining for ${dungeon.difficulty.toUpperCase()} dungeons.`);
                }
            }

            // Apply cooldown
            if (guild && !isPrivileged) {
                setDungeonCooldown(guild, dungeon.difficulty);
                await updateGuild(guild);
            }

            // ---------------- Run Raid ----------------
            const raidLog = await runDungeonRaid(sender, dungeon.name);

            // Apply guild buffs to rewards
            const finalRewards = applyGuildRewardsBuff(guild, raidLog.rewards);

            // Re-fetch player since runDungeonRaid updates it
            const updatedPlayer = await getPlayerProfile(sender);

            // Adjust for buffs
            if (updatedPlayer.progression) {
                updatedPlayer.gold += (finalRewards.gold - raidLog.rewards.gold);
                updatedPlayer.exp += (finalRewards.xp - raidLog.rewards.xp);
            } else {
                updatedPlayer.gold += (finalRewards.gold - raidLog.rewards.gold);
                updatedPlayer.exp += (finalRewards.xp - raidLog.rewards.xp);
            }

            // Track solo clear for Lone Wolf
            if (!guild && isPrivileged) {
                updatedPlayer.stats = updatedPlayer.stats || {};
                updatedPlayer.stats.solo_dungeons = (updatedPlayer.stats.solo_dungeons || 0) + 1;
                checkLoneWolfAchievements(updatedPlayer);
            }

            await updatePlayer(updatedPlayer);

            // ---------------- Record Guild PvP Race ----------------
            if (guild) {
                // Generate a pseudo-random time based on floors and difficulty
                const timeTaken = dungeon.floors * (Math.floor(Math.random() * 60) + 30);
                await recordGuildRace(dungeon.name, guild.name, timeTaken, raidLog.monstersDefeated.length);

                // Give Guild XP and Stats
                const gXp = dungeon.floors * 250;
                await addGuildXP(guild.name, gXp);

                // Fetch fresh guild object to avoid stale stats
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

            // Leaderboard snippet
            let lbMsg = "";
            if (guild) {
                const leaderboard = await getGuildLeaderboard(dungeon.name);
                if (leaderboard.length > 0) {
                    lbMsg = `\n\n🥇 *Top Guild:* ${leaderboard[0].guild} (${leaderboard[0].time}s)`;
                }
            }

            await reply(
                `🗡️ *Dungeon Raid Complete!* 🗡️\n\n` +
                `🏰 *Dungeon:* ${raidLog.dungeon}\n` +
                `📈 *Difficulty:* ${raidLog.difficulty.toUpperCase()}\n\n` +
                `👾 *Monsters Defeated:* ${monsterCount}\n` +
                `💀 *Boss Defeated:* ${bosses}\n\n` +
                `💰 *Gold:* ${finalRewards.gold.toLocaleString()}${guild ? ` (Guild Buffed)` : ''}\n` +
                `✨ *XP:* ${finalRewards.xp.toLocaleString()}${guild ? ` (Guild Buffed)` : ''}` +
                lbMsg +
                titleMsg
            );

        } catch(e) {
            console.error(e);
            reply(`❌ Error: ${e.message}`);
        }
    }
};

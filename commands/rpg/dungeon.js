import { runDungeonRaid, DUNGEONS } from '../../utils/dungeon_manager.js';
import { getPlayerProfile } from '../../utils/rpg_user_manager.js';
import { getPlayerGuild } from '../../utils/guild_manager.js';

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
            // allow partial match
            const found = DUNGEONS.find(d => d.name.toLowerCase().includes(dungeonName.toLowerCase()));
            if (found) dungeonName = found.name;
            else return reply(`❌ Dungeon "${dungeonName}" not found.`);
        }

        try {
            const raidLog = await runDungeonRaid(sender, dungeonName);

            const monsterCount = raidLog.monstersDefeated.length;
            const bosses = raidLog.bossesDefeated.join(', ') || "None";
            const rewards = raidLog.rewards;

            let titleMsg = "";
            if(player.achievements && player.achievements.length){
                const relevantTitles = player.achievements.filter(t => !t.includes("Lone Wolf"));
                if (relevantTitles.length) {
                    titleMsg = `\n\n🏆 *Titles Earned:* ${relevantTitles.join(', ')}`;
                }
            }

            // Check if player has Lone Wolf title
            if (player.roles?.includes("🐺 Lone Wolf")) {
                titleMsg += `\n🐺 *Active Title:* 🐺 Lone Wolf`;
            }

            await reply(
                `🗡️ *Dungeon Raid Complete!* 🗡️\n\n` +
                `🏰 *Dungeon:* ${raidLog.dungeon}\n` +
                `📈 *Difficulty:* ${raidLog.difficulty.toUpperCase()}\n\n` +
                `👾 *Monsters Defeated:* ${monsterCount}\n` +
                `💀 *Boss Defeated:* ${bosses}\n\n` +
                `💰 *Gold:* ${rewards.gold}\n` +
                `✨ *XP:* ${rewards.xp}` +
                titleMsg
            );

        } catch(e) {
            console.error(e);
            reply(`❌ Error: ${e.message}`);
        }
    }
};

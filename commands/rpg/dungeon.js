import { runDungeonRaid, DUNGEONS } from '../../utils/dungeon_manager.js';
import { getPlayerProfile } from '../../utils/rpg_user_manager.js';

export default {
    name: 'dungeon',
    description: 'Enter a dungeon and battle monsters & bosses',
    async execute(context) {
        const { msg, reply, sender, args } = context;
        const playerJid = sender;
        const player = await getPlayerProfile(playerJid);
        if(!player) return reply("Player profile not found.");

        // Randomly pick a dungeon if none is specified
        let dungeonName = args[0];

        if (!dungeonName) {
            dungeonName = DUNGEONS[Math.floor(Math.random() * DUNGEONS.length)].name;
        } else {
            // allow partial match
            const found = DUNGEONS.find(d => d.name.toLowerCase().includes(dungeonName.toLowerCase()));
            if (found) dungeonName = found.name;
        }

        try {
            const raidLog = await runDungeonRaid(playerJid, dungeonName);

            const monsterList = raidLog.monstersDefeated.join(', ');
            const bosses = raidLog.bossesDefeated.join(', ') || "None";
            const rewards = raidLog.rewards;

            let titleMsg = "";
            if(player.achievements && player.achievements.length){
                titleMsg = `\n\n🏆 *Titles Earned:* ${player.achievements.join(', ')}`;
            }

            await reply(
                `🗡️ *Dungeon Raid Complete!* 🗡️\n\n` +
                `🏰 *Dungeon:* ${raidLog.dungeon}\n` +
                `📈 *Difficulty:* ${raidLog.difficulty.toUpperCase()}\n\n` +
                `👾 *Monsters Defeated:* ${raidLog.monstersDefeated.length}\n` +
                `💀 *Boss Defeated:* ${bosses}\n\n` +
                `💰 *Gold:* ${rewards.gold}\n` +
                `✨ *XP:* ${rewards.xp}` +
                titleMsg
            );

        } catch(e) {
            console.error(e);
            reply("❌ Error running dungeon raid. Make sure the dungeon exists.");
        }
    }
};

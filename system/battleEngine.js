import { savePlayer } from '../utils/player.js'
import { saveGuild } from '../utils/guilds.js'

export function scaleDragonForDungeon(dragon, dungeonQuest) {
    const multiplier = dungeonQuest.multiplier || 1;

    return {
        ...dragon,
        hp: Math.floor(dragon.hp * multiplier),
        attack: Math.floor(dragon.attack * multiplier),
        defense: Math.floor(dragon.defense * multiplier),
        moves: (dragon.moves || []).map(move => ({
            ...move,
            damage: Math.floor(move.damage * multiplier)
        }))
    };
}

export async function battleEngine(player, enemy) {
    // Simple logic for victory: if player has more XP/higher rank or just random for now
    // In a real system, this would be a turn-based battle
    console.log(`⚔️ Battle: ${player.username} vs ${enemy.name} (HP: ${enemy.hp})`);
    return Math.random() > 0.3; // 70% win chance for demo
}

export async function onDungeonFloorClear(player, guild, sock) {
    const quest = guild.activeQuest;
    if (!quest || quest.assignedTo !== player.id || quest.type !== 'dungeon') return;

    quest.currentFloor += 1;

    if (quest.currentFloor >= quest.targetFloors) {
        // Quest completed
        player.gold += quest.rewardGold;
        player.xp += quest.rewardXP;
        guild.activeQuest = null;

        await savePlayer(player);
        await saveGuild(guild);

        await sock.sendMessage(player.id, {
            text: `🎉 Dungeon Quest Completed! You conquered ${quest.description} and earned ${quest.rewardGold} gold + ${quest.rewardXP} XP!`
        });
    } else {
        await saveGuild(guild);
        await sock.sendMessage(player.id, {
            text: `🗝️ Dungeon progress: Floor ${quest.currentFloor}/${quest.targetFloors} [${quest.difficulty.toUpperCase()}]`
        });
    }
}

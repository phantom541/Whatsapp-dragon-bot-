import DB from './database.js';

// --- Record a dungeon raid ---
export async function recordDungeonRaid({ playerJid, dungeonName, difficulty, monstersDefeated, bossesDefeated, rewards }) {
    const logs = await DB.getDB('dungeon_logs');
    if (!logs.raids) logs.raids = [];

    const timestamp = Date.now();
    const raidEntry = {
        id: `raid_${timestamp}`,
        player: playerJid,
        dungeon: dungeonName,
        difficulty: difficulty,
        monstersDefeated,
        bossesDefeated,
        rewards,
        timestamp
    };

    logs.raids.push(raidEntry);
    await DB.saveDB('dungeon_logs');

    return raidEntry;
}

// --- Get logs by player ---
export async function getPlayerRaids(playerJid) {
    const logs = await DB.getDB('dungeon_logs');
    if (!logs.raids) return [];
    return logs.raids.filter(r => r.player === playerJid);
}

// --- Get logs by dungeon ---
export async function getDungeonRaids(dungeonName) {
    const logs = await DB.getDB('dungeon_logs');
    if (!logs.raids) return [];
    return logs.raids.filter(r => r.dungeon === dungeonName);
}

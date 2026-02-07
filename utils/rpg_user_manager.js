import DB from './database.js';

export async function getPlayerProfile(jid) {
    const data = await DB.getDB('users');
    const player = data.users[jid];
    if (player) {
        // Compatibility for user's requested structure
        if (!player.progression) player.progression = { gold: player.gold || 0, xp: player.exp || 0 };
        if (!player.inventory) player.inventory = { items: {} };
        if (!player.achievements) player.achievements = player.roles || [];
    }
    return player;
}

export async function updatePlayer(player) {
    const data = await DB.getDB('users');
    // Sync back progression to main fields
    if (player.progression) {
        if (player.infiniteMoney) {
            player.progression.gold = Infinity;
            player.gold = Infinity;
        } else {
            player.gold = player.progression.gold;
        }
        player.exp = player.progression.xp;
    }
    if (player.achievements) {
        player.roles = player.achievements;
    }

    data.users[player.jid] = player;
    await DB.saveDB('users');
}

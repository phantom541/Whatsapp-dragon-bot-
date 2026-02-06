import db from '../utils/database.js';

export async function spawnDragon(groupId) {
    const spawnsData = await db.readJSON('spawns.json');
    const spawns = spawnsData.spawns;

    if(!spawns[groupId]) spawns[groupId] = [];

    // placeholder dragon
    const dragon = {
        id: Date.now(),
        name: 'Drako Phantom',
        rarity: 'S',
        level: 1,
        owner: null,
    };

    spawns[groupId].push(dragon);
    await db.writeJSON('spawns.json', { spawns });

    return dragon;
}

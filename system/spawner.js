import { readJSON, writeJSON } from '../utils/database.js';

export function spawnDragon(groupId) {
    const spawns = readJSON('./database/spawns.json');

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
    writeJSON('./database/spawns.json', spawns);

    return dragon;
}

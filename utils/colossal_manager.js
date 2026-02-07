import { COLOSSAL_BEASTS } from '../data/colossal_beasts.js';
import { spawnColossalBeast as lockWorld, getActiveColossal, clearColossalBeast, isWorldLocked } from './world_state.js';

export async function spawnRandomColossal() {
    if (await isWorldLocked()) return null;

    const beast = COLOSSAL_BEASTS[Math.floor(Math.random() * COLOSSAL_BEASTS.length)];
    await lockWorld(beast);
    return beast;
}

export async function getActiveBeast() {
    return await getActiveColossal();
}

export async function defeatBeast() {
    await clearColossalBeast();
    return true;
}

export function getBeastByName(name) {
    return COLOSSAL_BEASTS.find(b => b.name.toLowerCase().includes(name.toLowerCase()));
}

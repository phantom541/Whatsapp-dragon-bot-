import { spawnRandomColossal, getActiveBeast } from './colossal_manager.js';
import { notifyColossalSpawn } from './notifications.js';
import DB from './database.js';

export async function scheduleWeeklyColossalEvent(sock) {
    const worldDb = await DB.getDB('world');

    // Ensure next spawn is set
    if (!worldDb.nextWeeklySpawn) {
        worldDb.nextWeeklySpawn = Date.now() + 7 * 24 * 60 * 60 * 1000;
        await DB.saveDB('world');
    }

    setInterval(async () => {
        const now = Date.now();
        if (now < worldDb.nextWeeklySpawn) return;

        // Try to spawn if nothing active
        if (await getActiveBeast()) return;

        const beast = await spawnRandomColossal();
        if (beast) {
            // Pick a random group from those that have wild mode enabled or known groups
            const userDb = await DB.getDB('users');
            const groups = Object.keys(userDb.groups || {});

            if (groups.length > 0) {
                const randomGroup = groups[Math.floor(Math.random() * groups.length)];
                await notifyColossalSpawn(sock, randomGroup);
                console.log(`🦖 Weekly Colossal Beast ${beast.name} spawned in group ${randomGroup}`);
            }

            // Schedule next week
            worldDb.nextWeeklySpawn = now + 7 * 24 * 60 * 60 * 1000;
            await DB.saveDB('world');
        }
    }, 60 * 1000); // Check every minute
}

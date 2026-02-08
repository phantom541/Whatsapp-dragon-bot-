import DB from './database.js';

export async function rankUp(jid, amount = 1) {
    const db = await DB.getDB('users');
    const user = db.users[jid];
    if (!user) return;

    // Stub for rankUp
    user.rank = "Eternal Dragonlord"; // Max rank
    await DB.saveDB('users');
}

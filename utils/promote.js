import DB from './database.js';

export async function promoteToOwner(jid) {
    const db = await DB.getDB('users');
    const user = db.users[jid];
    if (!user) return;

    user.isOwner = true;
    user.roles = user.roles || [];
    if (!user.roles.includes('owner')) {
        user.roles.push('owner');
    }
    user.admin = true;

    await DB.saveDB('users');
}

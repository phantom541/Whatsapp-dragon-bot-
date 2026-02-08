import DB from './database.js';
import { STARTER_DRAGONS } from '../data/dragon_templates.js';

export async function grantColossal(jid, index = 0) {
    const db = await DB.getDB('users');
    const user = db.users[jid];
    if (!user) return;

    // Just give a legendary dragon or similar as a stub for colossal grant
    const colossal = { ...STARTER_DRAGONS[0], id: 'colossal_reward', name: 'Death\'s Defier Dragon', rarity: 'Legendary', level: 100 };
    user.dragons = user.dragons || [];
    user.dragons.push(colossal);

    await DB.saveDB('users');
}

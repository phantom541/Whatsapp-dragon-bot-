import DB from '../utils/database.js';

export async function startBattle(options) {
    const { attacker, defenderJid, forced, allowItems, allowEscape } = options;

    const db = await DB.getDB('users');
    const defender = db.users[defenderJid];

    if (!defender) return { winner: attacker.id };

    // Simple simulation for entity vs player
    // In a real implementation, this would handle turns and state.
    // For "Death", the outcome is almost certainly a loss for the player.

    let winner = attacker.id;

    // Determine winner based on a mix of stats and very small luck factor
    const playerAtk = (defender.dragons || []).reduce((sum, d) => sum + (d.atk || 0), 0);
    const playerHP = (defender.dragons || []).reduce((sum, d) => sum + (d.hp || 0), 0);

    // Death is ABSOLUTE. Only someone with cheat-level stats can win naturally.
    if (playerAtk >= attacker.defense && playerHP >= attacker.attack) {
        winner = defenderJid;
    } else {
        // 1 in 1000 chance of "defying death" by luck
        if (Math.random() < 0.001) {
            winner = defenderJid;
        }
    }

    return { winner };
}

import DB from '../../utils/database.js';

export default {
    name: 'colossalleaderboard',
    aliases: ['clb', 'beastleaderboard'],
    description: 'Top players who defeated Colossal Beasts.',
    async execute({ reply }) {
        const usersDb = await DB.getDB('users');
        const players = Object.values(usersDb.users || {});

        // Sort by number of beasts defeated
        players.sort((a, b) => (b.colossalBeastsDefeated?.length || 0) - (a.colossalBeastsDefeated?.length || 0));

        let message = `🏆 *Colossal Beast Leaderboard* 🏆\n\n`;
        const topPlayers = players.slice(0, 10).filter(p => (p.colossalBeastsDefeated?.length || 0) > 0);

        if (topPlayers.length === 0) {
            message += "No one has defeated a Colossal Beast yet! Will you be the first?";
        } else {
            topPlayers.forEach((p, idx) => {
                const count = p.colossalBeastsDefeated.length;
                message += `${idx + 1}. *${p.name}* — ${count} beasts\n`;
            });
        }

        return reply(message);
    }
};

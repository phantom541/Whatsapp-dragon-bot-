import { getActiveBeast, getBeastByName } from '../../utils/colossal_manager.js';

export default {
    name: 'colossal',
    description: 'Get info about a Colossal Beast.',
    async execute({ sock, msg, reply, args, from }) {
        const query = args.join(' ').trim();
        let beast;

        if (!query) {
            beast = await getActiveBeast();
            if (!beast) return reply('🏜️ No Colossal Beast is currently active in the world.');
        } else {
            beast = getBeastByName(query);
        }

        if (!beast) return reply(`❌ No Colossal Beast found matching "${query}".`);

        let response = `🦖 *Colossal Beast Info*\n\n`;
        response += `*Name:* ${beast.name}\n`;
        response += `*Element:* ${beast.affinity || beast.type}\n`;
        response += `*Level:* ${beast.level}\n`;
        response += `*HP:* ${beast.hp.toLocaleString()}\n`;
        response += `*Weaknesses:* ${beast.weaknesses?.join(', ') || 'None'}\n\n`;
        response += `*Moves:*\n• ${beast.moves?.slice(0, 5).join('\n• ')}\n\n`;
        response += `Use *=battle colossal* to fight the active beast!`;

        if (beast.image) {
            await sock.sendMessage(from, { image: { url: beast.image }, caption: response }, { quoted: msg });
        } else {
            reply(response);
        }
    }
};

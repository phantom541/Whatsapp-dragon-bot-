import { startColossalBattle } from '../../utils/battle_manager.js';

export default {
    name: 'battlecolossal',
    aliases: ['battle_colossal', 'bc'],
    description: 'Fight the active Colossal Beast in a 1v1 battle.',
    async execute({ msg, reply, sender }) {
        try {
            const { success, message } = await startColossalBattle(sender);
            if (!success) return reply(message);

            let response = `${message}\n\n` +
                `💡 Use *%bag* to access your inventory during battle.\n` +
                `💥 Use *%attack* to deal damage, or *%use <number>* for items!`;

            return reply(response);
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    }
};

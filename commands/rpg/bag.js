import { getPlayerProfile } from '../../utils/rpg_user_manager.js';
import DB from '../../utils/database.js';

export default {
    name: 'bag',
    aliases: ['inv', 'inventory'],
    description: 'View and use items in your bag, even during battle.',
    async execute({ sender, reply }) {
        const player = await getPlayerProfile(sender);
        if (!player) return reply('❌ Player profile not found.');

        if (!player.inventory || (!player.inventory.items && player.inventory.length === 0)) {
            return reply('📦 Your bag is empty.');
        }

        let inventoryList = '';
        const items = player.inventory.items || {};

        if (Object.keys(items).length > 0) {
            inventoryList = Object.entries(items)
                .map(([name, qty], idx) => `${idx + 1}. ${name} x${qty}`)
                .join('\n');
        } else if (Array.isArray(player.inventory)) {
             inventoryList = player.inventory
                .map((item, idx) => `${idx + 1}. ${item.name} x${item.quantity || 1}`)
                .join('\n');
        }

        if (!inventoryList) return reply('📦 Your bag is empty.');

        let response = `📦 *Your Bag*\n\n${inventoryList}\n\n`;
        response += 'Use an item with *%use <number>* (e.g. %use 1)';

        return reply(response);
    }
};

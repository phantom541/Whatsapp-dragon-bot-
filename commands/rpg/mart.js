import { ALL_MART_ITEMS } from '../../data/mart_items.js';

export default {
    name: 'mart',
    aliases: ['shop', 'store'],
    description: 'View the bot mart pages and buy items.',
    async execute({ msg, reply, args }) {
        let pageNum = 1;

        // Find page arg: %mart --page=2 or %mart 2
        const pageArg = args.find(a => a.startsWith('--page='))?.split('=')[1] || args[0];
        if (pageArg) {
            const p = parseInt(pageArg);
            if (!isNaN(p) && p >= 1 && p <= 6) {
                pageNum = p;
            }
        }

        const start = (pageNum - 1) * 7;
        const end = start + 7;
        const pageItems = ALL_MART_ITEMS.slice(start, end);

        if (!pageItems.length) return reply('❌ This mart page does not exist.');

        let response = `🛒 *Mart - Page ${pageNum}/6*\n\n`;
        pageItems.forEach((item, i) => {
            response += `${i + 1 + start}. *${item.name}* - ${item.price.toLocaleString()}G\n   _${item.description}_\n\n`;
        });

        response += `Use *%buy <name>* to purchase an item.\nUse *%mart --page=<1-6>* to flip pages.`;

        reply(response);
    }
};

import { ALL_MART_ITEMS } from '../../data/mart_items.js';
import { getPlayerProfile, updatePlayer } from '../../utils/rpg_user_manager.js';

export default {
    name: 'buy',
    description: 'Buy an item from the mart.',
    async execute({ msg, reply, args, sender }) {
        if (!args[0]) return reply('❌ Please specify an item to buy. Example: *%buy Health Potion*');

        const itemName = args.join(' ').trim().toLowerCase();
        const item = ALL_MART_ITEMS.find(i => i.name.toLowerCase() === itemName);

        if (!item) return reply(`❌ Item "${args.join(' ')}" not found in the mart.`);

        const player = await getPlayerProfile(sender);
        if (!player) return reply('❌ Player profile not found.');

        // Compatibility check for gold
        const currentGold = player.progression?.gold || player.gold || 0;

        if (currentGold < item.price) {
            return reply(`❌ You need ${item.price.toLocaleString()}G to buy "${item.name}". You currently have ${currentGold.toLocaleString()}G.`);
        }

        // Deduct gold
        if (player.progression) {
            player.progression.gold -= item.price;
        } else {
            player.gold -= item.price;
        }

        // Add to inventory
        player.inventory = player.inventory || { items: {} };
        if (Array.isArray(player.inventory)) {
            // If it was an array (from previous implementation stub), convert to object or just push
            player.inventory.push({ name: item.name, quantity: 1, boughtAt: Date.now() });
        } else {
            player.inventory.items = player.inventory.items || {};
            player.inventory.items[item.name] = (player.inventory.items[item.name] || 0) + 1;
        }

        await updatePlayer(player);

        reply(`✅ You bought *${item.name}* for ${item.price.toLocaleString()}G.\n💰 Remaining Gold: ${(player.progression?.gold || player.gold).toLocaleString()}G`);
    }
};

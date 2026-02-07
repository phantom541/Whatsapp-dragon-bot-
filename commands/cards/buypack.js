import { pullPack } from "../../utils/cards.js";
import DB from "../../utils/database.js";
import { deductGold } from "../../utils/economy.js";

export default {
    name: "buypack",
    description: "Buy a card pack.",
    async execute({ sock, msg, reply, args, sender }) {
        const size = parseInt(args[0]) || 3;
        if (size > 10) return reply("❌ Max pack size is 10.");

        const cost = size * 1000; // Generic cost for now
        const success = await deductGold(sender, cost);
        if (!success) return reply(`❌ You need ${cost}G to buy this pack.`);

        const cards = pullPack(size);
        if (cards.length === 0) return reply("❌ No cards available in the pool.");

        const userDb = await DB.getDB('users');
        userDb.users ??= {};
        userDb.users[sender] ??= { cards: [] };

        cards.forEach(c => userDb.users[sender].cards.push({
            ...c,
            pulledAt: Date.now()
        }));

        await DB.saveDB('users');

        const list = cards
            .map((c, i) => `*${i + 1}.* ${c.name} - ${c.tier}`)
            .join("\n");

        const text = `
🎉 You have claimed these cards

${list}

It has been stored in your collection
`;

        await sock.sendMessage(msg.key.remoteJid, {
            text: text.trim()
        });

        // Optionally send images sequentially as mentioned by user
        for (const card of cards) {
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: card.image },
                caption: `${card.name} (Tier ${card.tier})`
            });
        }
    }
};

import DB from "../../utils/database.js";
import { priceFromTier } from "../../utils/cards.js";
import { deductGold } from "../../utils/economy.js";

export default {
    name: "claim",
    description: "Claim a spawned card using its captcha.",
    async execute({ sock, msg, reply, args, sender }) {
        const captcha = args[0]?.toUpperCase();
        if (!captcha) return reply("❌ Please provide the captcha. Example: *%claim ABC123*");

        const spawn = global.activeSpawns?.[captcha];
        if (!spawn) {
            return reply("❌ Invalid or expired captcha.");
        }

        const price = priceFromTier(spawn.tier);
        const success = await deductGold(sender, price);

        if (!success) {
            return reply(`❌ You don't have enough gold! (Cost: ${price}G)`);
        }

        const userDb = await DB.getDB('users');
        userDb.users ??= {};
        userDb.users[sender] ??= { cards: [] };

        userDb.users[sender].cards.push({
            ...spawn,
            claimedAt: Date.now()
        });

        delete global.activeSpawns[captcha];
        await DB.saveDB('users');

        await sock.sendMessage(msg.key.remoteJid, {
            image: { url: spawn.image },
            caption: `✅ You claimed *${spawn.name}* (Tier ${spawn.tier})`
        });
    }
};

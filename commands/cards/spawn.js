import { generateCaptcha, priceFromTier, weightedRandomCard } from "../../utils/cards.js";

export default {
    name: "spawncard",
    aliases: ["cardspawn"],
    description: "Spawn a random card.",
    async execute({ sock, msg, reply }) {
        const card = weightedRandomCard();
        if (!card) return reply("❌ No cards found in the registry. Run the generator script first.");

        const captcha = generateCaptcha();
        const price = priceFromTier(card.tier);

        global.activeSpawns ??= {};
        global.activeSpawns[captcha] = card;

        const text = `
🃏 A New Card Has Appeared! 🃏

❀ Name: ${card.name}
❀ Tier: ${card.tier}
❀ Source: ${card.source}
❀ Captcha: ${captcha}
❀ Cost: ${price}

Use *%claim ${captcha}* to claim it!
`;

        await sock.sendMessage(msg.key.remoteJid, {
            image: { url: card.image },
            caption: text.trim()
        });
    }
};

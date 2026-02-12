import { CARDS } from "../../data/cards.js";
import DB from "../../utils/database.js";

export default {
  name: "cardinfo",
  aliases: ["cf"],
  description: "Show info of a card by ID or Name",
  execute: async ({ sock, from, args, reply }) => {
    const search = args.join(" ").trim();
    if (!search) {
        return reply("Usage: =cardinfo <cardID | card name>");
    }

    // 1) Try ID
    let card = CARDS.find(c => c.id.toString() === search);

    // 2) Try name
    if (!card) {
      const lower = search.toLowerCase();
      card = CARDS.find(
        (c) => (c.name || "").toLowerCase() === lower
      );
    }

    if (!card) {
        return reply("❌ Card not found in registry.");
    }

    // To check owners, we still need the user DB
    const userDb = await DB.getDB('users');
    const allUsers = Object.values(userDb.users || {});
    const owners = allUsers.filter(u => u.cards && u.cards.some(c => c.id === card.id));
    const ownerCount = owners.length;
    const cleanOwners = owners.map(u => u.id.replace("@s.whatsapp.net", ""));
    const ownerText = ownerCount > 0 ? `👥 Owners (${ownerCount}):\n• ${cleanOwners.join("\n• ")}` : `👥 Owners: ${ownerCount}`;

    const caption = `✨ *Card Details* ✨

🎴 *Name:* ${card.name}
⭐ *Tier:* ${card.tier}
📚 *Source:* ${card.source}
🆔 *ID:* ${card.id}

${ownerText}
`;

    try {
      if (card.image) {
        await sock.sendMessage(from, { image: { url: card.image }, caption });
        return;
      }
    } catch (e) {
      console.error("cardinfo image error:", e);
    }

    return reply(caption);
  }
};

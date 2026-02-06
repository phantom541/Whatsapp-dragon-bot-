import DB from "../../utils/database.js";
import fs from "fs";
import path from "path";

// Safely resolve local file if used
function resolveLocalImagePath(relPath) {
  if (!relPath) return null;
  if (path.isAbsolute(relPath)) return fs.existsSync(relPath) ? relPath : null;
  const abs = path.resolve(relPath);
  return fs.existsSync(abs) ? abs : null;
}

export default {
  name: "cardinfo",
  aliases: ["cf"],
  description: "Show info of a card by ID or Name",
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const search = args.join(" ").trim();
    if (!search) {
        return sock.sendMessage(from, { text: "Usage: %cardinfo <cardID | card name>" });
    }

    const db = await DB.getDB('cards');
    db.cards = db.cards || {};

    // 1) Try ID
    let card = db.cards[search];

    // 2) Try name
    if (!card) {
      const lower = search.toLowerCase();
      card = Object.values(db.cards).find(
        (c) => (c.name || "").toLowerCase() === lower
      );
    }

    if (!card) {
        return sock.sendMessage(from, { text: "❌ Card not found." });
    }

    // owner count
    const ownerCount = (card.owners || []).length;
    const cleanOwners = (card.owners || []).map(jid => jid.replace("@s.whatsapp.net", ""));
    const ownerText = ownerCount > 0 ? `👥 Owners (${ownerCount}):\n• ${cleanOwners.join("\n• ")}` : `👥 Owners: ${ownerCount}`;

    const caption = `✨ *Card Details* ✨

🎴 *Name:* ${card.name}
⭐ *Tier:* ${card.tier}
📚 *Series:* ${card.series}
💵 *Price:* $${card.price}
🆔 *ID:* ${card.id}

${ownerText}
`;

    try {
      // check if image is URL
      if (card.image && /^https?:\/\//i.test(card.image)) {
        await sock.sendMessage(from, { image: { url: card.image }, caption });
        return;
      }

      // else check local path
      const local = resolveLocalImagePath(card.image);
      if (local) {
        const buffer = fs.readFileSync(local);
        await sock.sendMessage(from, { image: buffer, caption });
        return;
      }
    } catch (e) {
      console.error("cardinfo image error:", e);
    }

    // fallback to text if image fails
    return sock.sendMessage(from, { text: caption });
  }
};

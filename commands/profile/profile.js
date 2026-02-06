import DB from '../../utils/database.js';
import { getUser } from '../../utils/economy.js';
import { getUserJid, getDisplayName } from '../../utils/player.js';

export default {
  name: 'profile',
  description: 'View your player profile',

  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);
    const pushName = getDisplayName(msg);

    const player = await getUser(jid, pushName);

    // Find companion image
    let companionImage = null;
    if (player.dragons && player.dragons.length > 0) {
        const companion = player.dragons.find(d => d.name === player.companion) || player.dragons[0];
        companionImage = companion.image;
    }

    let pfp;
    try {
      pfp = await sock.profilePictureUrl(jid, 'image');
    } catch {
      pfp = null;
    }

    const caption =
`🏮 *Name:* ${player.name}
🌐 *Web Username:* ${player.username || "@None"}
🛅 *Web Security:* ${player.webSecurity || "Nope"}
🔖 *Bio:* ${player.bio || "None"}

🎏 *Experience:* ${player.exp}
🏅 *Rank:* ${player.rank}

🧣 *Companion:* ${player.companion || "None"}
🍀 *Total Dragons:* ${player.totalDragons || 0}
🃏 *Cards:* ${player.cards || 0}

♥ *Haigusha:* ${player.haigusha || "None"}
🍁 *Quiz Wins:* ${player.quizWins || 0}

👑 *Admin:* ${player.admin || false}
💈 *Ban:* ${player.banned || false}
`;

    // Priority: Companion image, then WhatsApp PFP
    const imageUrl = companionImage || pfp;

    if (imageUrl) {
      await sock.sendMessage(from, {
        image: { url: imageUrl },
        caption
      });
    } else {
      await sock.sendMessage(from, { text: caption });
    }
  }
};

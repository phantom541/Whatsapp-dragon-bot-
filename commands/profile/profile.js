import { getUser } from '../../utils/economy.js';
import { getUserJid, getDisplayName } from '../../utils/player.js';
import { getPlayerDragons } from '../../utils/dragons.js';

export default {
  name: 'profile',
  description: 'View your player profile',

  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const jid = getUserJid(msg);
    const pushName = getDisplayName(msg);

    const player = await getUser(jid, pushName);
    const dragons = await getPlayerDragons(jid);

    let pfp;
    try {
      pfp = await sock.profilePictureUrl(jid, 'image');
    } catch {
      pfp = null;
    }

    const companion = dragons.length > 0 ? dragons[0] : null;

    const caption =
`🏮 *Name:* ${player.name}
🌐 *Web Username:* ${player.username || "@None"}
🛅 *Web Security:* ${player.webSecurity || "Nope"}
🔖 *Bio:* ${player.bio || "None"}

🎏 *Experience:* ${player.exp || 0}
🏅 *Rank:* ${player.rank}

🧣 *Companion:* ${companion ? companion.name : 'None'}
🍀 *Total Dragons:* ${dragons.length}
🃏 *Cards:* ${player.cards || 0}

♥ *Haigusha:* ${player.haigusha || "None"}
🍁 *Quiz Wins:* ${player.quizWins || 0}

👑 *Admin:* ${player.admin || false}
💈 *Ban:* ${player.banned || false}
`;

    // Priority: Companion image if exists, else WhatsApp PFP, else just text
    if (companion && companion.image) {
        await sock.sendMessage(from, {
            image: { url: companion.image },
            caption
        });
    } else if (pfp) {
      await sock.sendMessage(from, {
        image: { url: pfp },
        caption
      });
    } else {
      await sock.sendMessage(from, { text: caption });
    }
  }
};

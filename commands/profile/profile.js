import { getUserJid } from '../../utils/player.js';

export default {
  name: 'profile',
  description: 'View your player profile',

  execute: async ({ sender, reply, sock, from, getPlayer }) => {
    const player = getPlayer(sender);

    // Find companion image
    let companionImage = null;
    const dragons = player.dragons || [];
    if (dragons.length > 0) {
        const companion = dragons.find(d => d.name === player.companion) || dragons[0];
        companionImage = companion.image;
    }

    let pfp;
    try {
      pfp = await sock.profilePictureUrl(sender, 'image');
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
🍀 *Total Dragons:* ${dragons.length}
🃏 *Cards:* ${player.cards || 0}

♥ *Haigusha:* ${player.haigusha || "None"}
🍁 *Quiz Wins:* ${player.quizWins || 0}

👑 *Admin:* ${player.admin || false}
💈 *Ban:* ${player.banned || false}
`;

    const imageUrl = companionImage || pfp;

    if (imageUrl) {
      await sock.sendMessage(from, {
        image: { url: imageUrl },
        caption
      });
    } else {
      await reply(caption);
    }
  }
};

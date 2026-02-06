import { getOrCreatePlayer, getUserJid } from '../../utils/player.js';

export default {
  name: 'profile',
  description: 'View your player profile',

  execute: async (sock, msg) => {
    const from = msg.key.remoteJid;
    const player = await getOrCreatePlayer(msg);
    const jid = getUserJid(msg);

    let pfp;
    try {
      pfp = await sock.profilePictureUrl(jid, 'image');
    } catch {
      pfp = null;
    }

    const caption =
`🏮 *Name:* ${player.name}#${player.number.slice(-4)}

🌐 *Web Username:* @None
🛅 *Web Security:* Nope
🔖 *Bio:* ${player.bio || '—'}

🎏 *Experience:* ${player.exp}
🏅 *Rank:* ${player.rank}

🧣 *Companion:* None
🍀 *Total Dragons:* ${player.dragons.length}
🃏 *Cards:* ${player.cards}

♥ *Haigusha:* None
🍁 *Quiz Wins:* 0

👑 *Admin:* ${player.admin}
💈 *Ban:* ${player.banned}
`;

    if (pfp) {
      await sock.sendMessage(from, {
        image: { url: pfp },
        caption
      });
    } else {
      await sock.sendMessage(from, { text: caption });
    }
  }
};

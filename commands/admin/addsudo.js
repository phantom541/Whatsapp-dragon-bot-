import { getUser } from "../../utils/economy.js";
import { isOwner } from "../../utils/helpers.js";
import DB from '../../utils/database.js';

export default {
  name: 'addsudo',
  description: 'Promote a user to mod.',
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!await isOwner(sender)) {
      return sock.sendMessage(from, { text: 'You do not have permission to use this command.' });
    }

    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) {
      return sock.sendMessage(from, { text: 'Please mention a user to promote.' });
    }

    const playerToPromote = await getUser(mentionedJid);
    if (!playerToPromote.roles) {
      playerToPromote.roles = [];
    }

    if (playerToPromote.roles.includes('mod')) {
      return sock.sendMessage(from, { text: 'This user is already a mod.' });
    }

    playerToPromote.roles.push('mod');
    await DB.saveDB('users');

    const targetName = playerToPromote.name || mentionedJid.split('@')[0];
    await sock.sendMessage(from, { text: `${targetName} has been promoted to a bot moderator.` });
  },
};

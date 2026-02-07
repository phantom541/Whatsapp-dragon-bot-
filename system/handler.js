import DB from '../utils/database.js';
import { loadCommands } from './loader.js';

let commands = {};

(async () => {
  commands = await loadCommands();
})();

const OWNER_JID = '26775949123@s.whatsapp.net';

export async function handleCommand(sock, msg, command, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const pushName = msg.pushName || sender.split('@')[0];

  if (!commands[command]) return;

  const db = await DB.getDB('users');
  db.users = db.users || {};
  db.sessions = db.sessions || {};

  const context = {
    sock,
    msg,
    from,
    sender,
    args,
    reply: (text) => sock.sendMessage(from, { text }),
    getPlayer: (jid) => db.users[jid || sender],
    updatePlayer: async (player) => {
      db.users[player.jid] = player;
      await DB.saveDB('users');
    },
    hasRole: (role) => {
      if (role === 'owner') {
        return sender === OWNER_JID;
      }
      return db.users[sender]?.roles?.includes(role) || db.users[sender]?.admin;
    }
  };

  try {
    await commands[command].execute(context);
  } catch (err) {
    console.error(`❌ Error in command "${command}"`, err);
    await sock.sendMessage(from, { text: 'Something broke. Try again later.' });
  }
}

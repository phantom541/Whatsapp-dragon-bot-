import { loadCommands } from './loader.js';

let commands = {};

(async () => {
  commands = await loadCommands();
})();

export async function handleCommand(sock, msg, command, args) {
  const from = msg.key.remoteJid;

  if (!commands[command]) return;

  try {
    await commands[command].execute(sock, msg, args);
  } catch (err) {
    console.error(`❌ Error in command "${command}"`, err);
    await sock.sendMessage(from, { text: 'Something broke. Try again later.' });
  }
}

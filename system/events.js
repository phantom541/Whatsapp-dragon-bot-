import { handleCommand } from './handler.js';
import { getOrCreatePlayer } from '../utils/player.js';

export async function handleMessage(sock, msg) {
  const type = Object.keys(msg.message)[0];
  const text =
    msg.message.conversation ||
    msg.message[type]?.caption ||
    '';

  if (!text) return;

  // ensure player exists
  getOrCreatePlayer(msg);

  if (!text.startsWith('%')) return;

  const args = text.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  handleCommand(sock, msg, command, args);
}

import { handleCommand } from './handler.js';

export async function handleMessage(sock, msg) {
    const messageType = Object.keys(msg.message)[0];
    const text = msg.message.conversation || msg.message[messageType].caption || '';

    if(!text) return;

    // simple prefix check
    if(!text.startsWith('%')) return;

    const args = text.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    handleCommand(sock, msg, command, args);
}

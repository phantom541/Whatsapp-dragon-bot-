export default {
    name: 'ping',
    description: 'Check bot latency',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        await sock.sendMessage(from, { text: 'Pong!' });
    }
};

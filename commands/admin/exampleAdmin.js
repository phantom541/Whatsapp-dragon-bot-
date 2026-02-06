export default {
    name: 'admin',
    description: 'Admin command placeholder',
    execute: async (sock, msg, args) => {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Admin command executed!' });
    }
};

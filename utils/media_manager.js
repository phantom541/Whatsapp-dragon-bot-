import fs from 'fs';

export async function sendLocalFile(sock, jid, { filePath, caption = '', quoted = null }) {
    if (!fs.existsSync(filePath)) {
        return sock.sendMessage(jid, { text: '❌ File not found.' }, { quoted });
    }

    const ext = filePath.split('.').pop().toLowerCase();
    let messageContent = {};

    if (['mp4', 'mov', 'mkv'].includes(ext)) {
        messageContent = { video: fs.readFileSync(filePath), caption };
    } else if (['mp3', 'wav', 'aac', 'm4a'].includes(ext)) {
        messageContent = { audio: fs.readFileSync(filePath), caption, mimetype: 'audio/mp4', ptt: false };
    } else {
        messageContent = { document: fs.readFileSync(filePath), caption, fileName: filePath.split('/').pop() };
    }

    return sock.sendMessage(jid, messageContent, { quoted });
}

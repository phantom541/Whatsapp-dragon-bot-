export async function sendMessage(sock, jid, content) {
    return await sock.sendMessage(jid, content);
}

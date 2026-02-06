export async function sendMessage(sock, jid, message) {
    try {
        await sock.sendMessage(jid, message);
    } catch(e) {
        console.error('Error sending message', e);
    }
}

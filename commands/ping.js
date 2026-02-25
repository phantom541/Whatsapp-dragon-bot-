export default async function ping(sock, ctx) {
    await sock.sendMessage(ctx.jid, { text: '🏓 Pong' })
}

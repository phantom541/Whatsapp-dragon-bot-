import { getPlayer } from '../system/database.js'

export default async function profile(sock, ctx) {
    const player = await getPlayer(ctx.sender)

    await sock.sendMessage(ctx.jid, {
        text:
            `👤 Profile\n` +
            `Level: ${player.level}\n` +
            `Gold: ${player.gold}\n` +
            `XP: ${player.xp}`
    })
}

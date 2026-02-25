import { getPlayerGuild } from '../system/database.js'

export default async function titan(sock, ctx) {
    const guild = await getPlayerGuild(ctx.sender)

    if (!guild) {
        await sock.sendMessage(ctx.jid, { text: '❌ You are not in a guild.' })
        return
    }

    if (!guild.titans || !guild.titans.length) {
        await sock.sendMessage(ctx.jid, { text: '🗿 No titans owned.' })
        return
    }

    let text = `🗿 Guild Titans:\n`

    guild.titans.forEach(t => {
        text += `\nID: ${t.titanId}\nOwner: ${t.owner}\nBorrowedBy: ${t.borrowedBy || 'None'}\n`
    })

    await sock.sendMessage(ctx.jid, { text })
}

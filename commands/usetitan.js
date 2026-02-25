import { getPlayerGuild, canUseTitan } from '../system/database.js'

export default async function usetitan(sock, ctx) {
    const titanId = parseInt(ctx.args[0])
    if (!titanId) {
        await sock.sendMessage(ctx.jid, { text: '❌ Provide titan ID.' })
        return
    }

    const guild = await getPlayerGuild(ctx.sender)
    if (!guild) {
        await sock.sendMessage(ctx.jid, { text: '❌ You are not in a guild.' })
        return
    }

    if (!canUseTitan(ctx.sender, guild, titanId)) {
        await sock.sendMessage(ctx.jid, { text: '❌ You cannot use this titan.' })
        return
    }

    await sock.sendMessage(ctx.jid, { text: `✅ Titan ${titanId} ready for deployment!` })
}

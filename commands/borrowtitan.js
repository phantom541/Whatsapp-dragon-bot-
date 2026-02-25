import { loadGuilds, updateGuilds, getPlayerGuild } from '../system/database.js'

export default async function borrowtitan(sock, ctx) {
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

    const titan = guild.titans.find(t => t.titanId === titanId)

    if (!titan) {
        await sock.sendMessage(ctx.jid, { text: '❌ Titan not found.' })
        return
    }

    if (titan.borrowedBy && titan.borrowedBy !== ctx.sender) {
        await sock.sendMessage(ctx.jid, { text: '❌ Titan already borrowed.' })
        return
    }

    titan.borrowedBy = ctx.sender

    const guilds = await loadGuilds()
    guilds[guild.id] = guild
    await updateGuilds(guilds)

    await sock.sendMessage(ctx.jid, {
        text: `🗿 Titan ${titanId} borrowed successfully`
    })
}

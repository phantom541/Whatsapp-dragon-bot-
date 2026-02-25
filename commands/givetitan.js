import { getPlayerGuild, addTitanToGuild } from '../system/database.js'

export default async function givetitan(sock, ctx) {
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

    const titanData = {
        titanId,
        owner: ctx.sender,
        borrowedBy: null
    }

    await addTitanToGuild(guild.id, titanData)

    await sock.sendMessage(ctx.jid, {
        text: `🗿 Titan ${titanId} assigned to guild ${guild.name}`
    })
}

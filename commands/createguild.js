import { loadGuilds, saveGuilds, loadPlayers, savePlayers } from '../system/database.js'

export default async function createguild(sock, ctx) {
    const name = ctx.args.join(' ')
    if (!name) {
        await sock.sendMessage(ctx.jid, { text: '❌ Provide a guild name.' })
        return
    }

    const players = await loadPlayers()
    const player = players[ctx.sender]

    if (player.guild) {
        await sock.sendMessage(ctx.jid, { text: '❌ You are already in a guild.' })
        return
    }

    const guilds = await loadGuilds()
    const guildId = 'guild_' + Date.now()

    guilds[guildId] = {
        id: guildId,
        name: name,
        owner: ctx.sender,
        mods: [],
        members: [ctx.sender],
        gold: 0,
        titans: []
    }

    player.guild = guildId

    await saveGuilds(guilds)
    await savePlayers(players)

    await sock.sendMessage(ctx.jid, { text: `🏰 Guild "${name}" created!` })
}

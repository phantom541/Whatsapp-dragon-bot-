import { loadGuilds, saveGuilds, getPlayerGuild, loadPlayers, savePlayers } from '../system/database.js'

export default async function guilddeposit(sock, ctx) {
    const amount = parseInt(ctx.args[0])

    if (!amount || amount <= 0) {
        await sock.sendMessage(ctx.jid, { text: '❌ Enter a valid amount.' })
        return
    }

    const guild = await getPlayerGuild(ctx.sender)
    if (!guild) {
        await sock.sendMessage(ctx.jid, { text: '❌ You are not in a guild.' })
        return
    }

    const players = await loadPlayers()
    const player = players[ctx.sender]

    if (player.gold < amount) {
        await sock.sendMessage(ctx.jid, { text: '❌ Not enough gold.' })
        return
    }

    player.gold -= amount

    const guilds = await loadGuilds()
    guilds[guild.id].gold += amount

    await savePlayers(players)
    await saveGuilds(guilds)

    await sock.sendMessage(ctx.jid, {
        text: `🏰 Deposited ${amount} gold into ${guild.name}`
    })
}

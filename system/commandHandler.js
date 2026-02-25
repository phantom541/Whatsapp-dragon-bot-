import ping from '../commands/ping.js'
import profile from '../commands/profile.js'
import guilddeposit from '../commands/guilddeposit.js'
import givetitan from '../commands/givetitan.js'
import borrowtitan from '../commands/borrowtitan.js'
import titan from '../commands/titan.js'
import usetitan from '../commands/usetitan.js'
import dungeon from '../commands/dungeon.js'
import createguild from '../commands/createguild.js'

const commands = {
    ping,
    profile,
    guilddeposit,
    givetitan,
    borrowtitan,
    titan,
    usetitan,
    dungeon,
    createguild
}

export async function commandHandler(sock, ctx) {
    const cmd = commands[ctx.command]
    if (!cmd) return

    try {
        await cmd(sock, ctx)
    } catch (err) {
        console.error(err)
        await sock.sendMessage(ctx.jid, { text: '❌ Command error.' })
    }
}

import { createDungeon } from '../system/database.js'

const difficulties = ['easy','medium','hard','extreme','nightmare','youre evil']

export default async function dungeon(sock, ctx) {
    const diff = ctx.args.join(' ').toLowerCase()
    if (!difficulties.includes(diff)) {
        await sock.sendMessage(ctx.jid, { text: `❌ Invalid difficulty. Available: ${difficulties.join(', ')}` })
        return
    }

    const dungeon = await createDungeon(ctx.sender, diff)
    await sock.sendMessage(ctx.jid, {
        text: `🗺 Dungeon created!\nID: ${dungeon.id}\nDifficulty: ${dungeon.difficulty}`
    })
}

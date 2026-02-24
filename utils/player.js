import fs from 'fs-extra'

const DB_PATH = './database/players.json'

export async function getPlayer(sender) {
    let db = {}
    try {
        db = await fs.readJson(DB_PATH)
    } catch (e) {
        db = {}
    }

    if (!db[sender]) {
        db[sender] = {
            id: sender,
            username: sender.split('@')[0],
            gold: 0,
            bank: 0,
            xp: 0,
            rank: 'Novice',
            guild: null,
            dragons: [],
            titans: [],
            inventory: {},
            equipment: {
                mining: null,
                fishing: null,
                work: null
            },
            createdAt: Date.now()
        }

        await fs.writeJson(DB_PATH, db, { spaces: 2 })
        console.log(`🆕 New player created: ${sender}`)
    }

    return db[sender]
}

export async function savePlayer(player) {
    const db = await fs.readJson(DB_PATH)
    db[player.id] = player
    await fs.writeJson(DB_PATH, db, { spaces: 2 })
}

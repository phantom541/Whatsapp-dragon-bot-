import fs from 'fs-extra'

const playerFile = './database/players.json'
const guildFile = './database/guilds.json'
const dungeonFile = './data/dungeons.json'

export async function loadPlayers() {
    return fs.readJson(playerFile).catch(() => ({}))
}

export async function savePlayers(data) {
    await fs.writeJson(playerFile, data, { spaces: 2 })
}

export async function getPlayer(sender) {
    const players = await loadPlayers()
    if (!players[sender]) {
        players[sender] = {
            id: sender,
            username: sender.split('@')[0],
            gold: 0,
            bank: 0,
            xp: 0,
            level: 1,
            rank: 'Novice',
            guild: null,
            dragons: [],
            titans: [],
            inventory: {},
            equipment: { mining: null, fishing: null, work: null },
            createdAt: Date.now()
        }
        await savePlayers(players)
        console.log(`🆕 New player created: ${sender}`)
    }
    return players[sender]
}

export async function loadGuilds() {
    return fs.readJson(guildFile).catch(() => ({}))
}

export async function saveGuilds(data) {
    await fs.writeJson(guildFile, data, { spaces: 2 })
}

export async function getPlayerGuild(sender) {
    const players = await loadPlayers()
    const player = players[sender]
    if (!player || !player.guild) return null
    const guilds = await loadGuilds()
    return guilds[player.guild] || null
}

export async function addTitanToGuild(guildId, titanData) {
    const guilds = await loadGuilds()
    if (!guilds[guildId]) return
    if (!guilds[guildId].titans) guilds[guildId].titans = []
    guilds[guildId].titans.push(titanData)
    await saveGuilds(guilds)
}

export function canUseTitan(userJid, guild, titanId) {
    if (!guild.titans) return false
    const titan = guild.titans.find(t => t.titanId === titanId)
    if (!titan) return false

    // Owner or borrowedBy can use
    if (titan.owner === userJid || titan.borrowedBy === userJid) return true

    // Owner/mod bypass
    if (guild.owner === userJid) return true
    if (guild.mods && guild.mods.includes(userJid)) return true

    return false
}

export async function loadDungeons() {
    await fs.ensureFile(dungeonFile)
    return fs.readJson(dungeonFile).catch(() => ({}))
}

export async function saveDungeons(data) {
    await fs.writeJson(dungeonFile, data, { spaces: 2 })
}

export async function createDungeon(playerJid, difficulty) {
    const dungeons = await loadDungeons()

    const dungeonId = 'dungeon_' + Date.now()
    dungeons[dungeonId] = {
        id: dungeonId,
        difficulty,
        owner: playerJid,
        deployedTitans: [],
        completed: false
    }

    await saveDungeons(dungeons)
    return dungeons[dungeonId]
}

export async function updateGuilds(guilds) {
    await saveGuilds(guilds)
}

export async function getItems() {
    return fs.readJson('./database/items.json').catch(() => ({}))
}

export function addItem(player, itemId, amount = 1) {
    if (!player.inventory) player.inventory = {}
    player.inventory[itemId] = (player.inventory[itemId] || 0) + amount
}

export function hasCharm(player, charmId) {
    return (player.inventory?.[charmId] || 0) > 0
}

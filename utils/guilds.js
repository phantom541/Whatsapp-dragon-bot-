import fs from 'fs-extra'

const DB_PATH = './database/guilds.json'

export async function getGuild(guildId) {
    let db = {}
    try {
        db = await fs.readJson(DB_PATH)
    } catch (e) {
        db = {}
    }
    return db[guildId] || null
}

export async function saveGuild(guild) {
    const db = await fs.readJson(DB_PATH)
    db[guild.id] = guild
    await fs.writeJson(DB_PATH, db, { spaces: 2 })
}

export async function getPlayerGuild(player) {
    if (!player.guild) return null
    return await getGuild(player.guild)
}

const dungeonPool = [
    { name: "Crimson Spire", region: "Volcanic Peaks", floors: 10, difficultyLevels: 6 },
    { name: "Frostbite Hollow", region: "Icy Tundra", floors: 10, difficultyLevels: 6 },
    { name: "Emerald Labyrinth", region: "Mystic Forest", floors: 10, difficultyLevels: 6 },
    { name: "Obsidian Depths", region: "Shadow Caves", floors: 10, difficultyLevels: 6 },
    { name: "Thunderclap Citadel", region: "Stormlands", floors: 10, difficultyLevels: 6 }
]

const dungeonDifficulties = {
    easy: { multiplier: 1, rewardGold: 50000, rewardXP: 2000 },
    medium: { multiplier: 1.5, rewardGold: 100000, rewardXP: 5000 },
    hard: { multiplier: 2, rewardGold: 200000, rewardXP: 10000 },
    extreme: { multiplier: 3, rewardGold: 400000, rewardXP: 25000 },
    nightmare: { multiplier: 5, rewardGold: 1000000, rewardXP: 100000 }
}

export async function spawnRandomDungeon(guild, sock) {
    if (guild.activeQuest && guild.activeQuest.type === 'dungeon') return

    const dungeon = dungeonPool[Math.floor(Math.random() * dungeonPool.length)]
    const difficultyKeys = Object.keys(dungeonDifficulties)
    const chosenDifficulty = difficultyKeys[Math.floor(Math.random() * difficultyKeys.length)]
    const difficultyData = dungeonDifficulties[chosenDifficulty]

    guild.activeQuest = {
        id: `quest_dungeon_${Date.now()}`,
        description: `Clear the dungeon ${dungeon.name} (${dungeon.region}) [${chosenDifficulty.toUpperCase()}]`,
        type: "dungeon",
        targetFloors: dungeon.floors,
        currentFloor: 0,
        difficulty: chosenDifficulty,
        rewardGold: difficultyData.rewardGold,
        rewardXP: difficultyData.rewardXP,
        multiplier: difficultyData.multiplier,
        assignedTo: null
    }

    await saveGuild(guild)

    if (sock) {
        for (const member of guild.members) {
            await sock.sendMessage(member, {
                text: `🗡️ New dungeon: ${dungeon.name} (${dungeon.region})\nDifficulty: ${chosenDifficulty.toUpperCase()}\nUse =acceptquest to take it on!`
            })
        }
    }
}

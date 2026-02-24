import fs from 'fs-extra'

const ITEM_DB = './database/items.json'

export async function getItems() {
    try {
        return await fs.readJson(ITEM_DB)
    } catch (e) {
        return {}
    }
}

export function addItem(player, itemId, amount = 1) {
    if (!player.inventory) {
        player.inventory = {}
    }
    if (!player.inventory[itemId]) {
        player.inventory[itemId] = 0
    }
    player.inventory[itemId] += amount
}

import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs-extra'
import { getPlayer, savePlayer } from '../utils/player.js'
import { getItems, addItem } from '../utils/items.js'
import { hasCharm } from '../utils/charms.js'
import { getPlayerGuild, saveGuild, spawnRandomDungeon } from '../utils/guilds.js'
import { battleEngine, scaleDragonForDungeon, onDungeonFloorClear } from './battleEngine.js'

const PREFIX = '='

export async function connectBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true,
        browser: ['DragonBot', 'Chrome', '1.0']
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            console.log('❌ Connection closed. Reconnecting:', shouldReconnect)

            if (shouldReconnect) {
                connectBot()
            }
        } else if (connection === 'open') {
            console.log('🐉 Baileys connected')

            // Start periodic dungeon spawns
            setInterval(async () => {
                const guildsDB = await fs.readJson('./database/guilds.json')
                for (const guildId in guildsDB) {
                    await spawnRandomDungeon(guildsDB[guildId], sock)
                }
            }, 60 * 60 * 1000)
        }
    })

    // 🔥 MESSAGE HANDLER
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return

        const msg = messages[0]
        if (!msg.message) return
        if (msg.key.fromMe) return

        const jid = msg.key.remoteJid
        const sender = msg.key.participant || jid

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            ''

        if (!text.startsWith(PREFIX)) return

        const args = text.slice(PREFIX.length).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        console.log(`📨 ${sender} used command: ${command}`)

        try {
            const player = await getPlayer(sender)
            await handleCommand({ sock, jid, sender, command, args, msg, player })
        } catch (err) {
            console.error('Command error:', err)
            await sock.sendMessage(jid, { text: '❌ Command failed.' })
        }
    })
}

// COMMAND ROUTER
async function handleCommand({ sock, jid, sender, command, args, msg, player }) {
    const guild = await getPlayerGuild(player)

    switch (command) {
        case 'ping':
            await sock.sendMessage(jid, {
                text: `🏓 Pong\nPlayer: ${player.username}\nGold: ${player.gold}`
            })
            break

        case 'menu':
            await sock.sendMessage(jid, {
                text: `🐉 Dragon Bot Online
Prefix: =
Core systems: ✅
Baileys: ✅
Economy: ✅
Activities: ✅
Guilds: ✅`
            })
            break

        case 'profile':
            await sock.sendMessage(jid, {
                text: `🎴 Profile
Name: ${player.username}
Gold: ${player.gold}
Bank: ${player.bank}
XP: ${player.xp}
Rank: ${player.rank}
Guild: ${player.guild || 'None'}`
            })
            break

        case 'wallet':
            await sock.sendMessage(jid, {
                text: `💰 Wallet: ${player.gold}\n🏦 Bank: ${player.bank}`
            })
            break

        case 'deposit': {
            const amount = parseInt(args[0])
            if (isNaN(amount) || amount <= 0)
                return sock.sendMessage(jid, { text: 'Enter a valid amount.' })

            if (player.gold < amount)
                return sock.sendMessage(jid, { text: 'Not enough gold.' })

            player.gold -= amount
            player.bank += amount
            await savePlayer(player)

            await sock.sendMessage(jid, { text: `🏦 Deposited ${amount}` })
            break
        }

        case 'withdraw': {
            const amount = parseInt(args[0])
            if (isNaN(amount) || amount <= 0)
                return sock.sendMessage(jid, { text: 'Enter a valid amount.' })

            if (player.bank < amount)
                return sock.sendMessage(jid, { text: 'Not enough in bank.' })

            player.bank -= amount
            player.gold += amount
            await savePlayer(player)

            await sock.sendMessage(jid, { text: `💰 Withdrew ${amount}` })
            break
        }

        case 'give': {
            if (!msg.message.extendedTextMessage?.contextInfo?.mentionedJid)
                return sock.sendMessage(jid, { text: 'Mention a user.' })

            const targetId =
                msg.message.extendedTextMessage.contextInfo.mentionedJid[0]

            const amount = parseInt(args[1])
            if (isNaN(amount) || amount <= 0)
                return sock.sendMessage(jid, { text: 'Invalid amount.' })

            if (player.gold < amount)
                return sock.sendMessage(jid, { text: 'Not enough gold.' })

            const target = await getPlayer(targetId)

            player.gold -= amount
            target.gold += amount

            await savePlayer(player)
            await savePlayer(target)

            await sock.sendMessage(jid, {
                text: `💸 Sent ${amount} gold to ${target.username}`
            })
            break
        }

        case 'store': {
            const items = await getItems()
            let text = '🏬 Store\n\n'
            for (const id in items) {
                const item = items[id]
                text += `${id} - ${item.name} — ${item.price}\n`
            }
            text += '\nUse =buy <item_id>'
            await sock.sendMessage(jid, { text })
            break
        }

        case 'buy': {
            const itemId = args[0]
            if (!itemId)
                return sock.sendMessage(jid, { text: 'Provide item ID.' })

            const items = await getItems()
            const item = items[itemId]

            if (!item)
                return sock.sendMessage(jid, { text: 'Item not found.' })

            if (player.gold < item.price)
                return sock.sendMessage(jid, { text: 'Not enough gold.' })

            player.gold -= item.price

            // Auto equip tools
            if (item.type === 'tool') {
                if (item.effect === 'mine') player.equipment.mining = itemId
                if (item.effect === 'fish') player.equipment.fishing = itemId
                if (item.effect === 'work') player.equipment.work = itemId
            } else {
                addItem(player, itemId, 1)
            }

            await savePlayer(player)
            await sock.sendMessage(jid, { text: `🛒 Bought ${item.name}` })
            break
        }

        case 'inventory': {
            const items = await getItems()
            const inv = player.inventory
            let text = '🎒 Inventory\n\n'
            let hasItems = false
            for (const id in inv) {
                if (inv[id] > 0) {
                    const itemName = items[id]?.name || id
                    text += `${itemName} x${inv[id]}\n`
                    hasItems = true
                }
            }
            if (!hasItems) return sock.sendMessage(jid, { text: '🎒 Inventory empty.' })
            await sock.sendMessage(jid, { text })
            break
        }

        case 'slot': {
            const bet = parseInt(args[0])
            if (isNaN(bet) || bet <= 0)
                return sock.sendMessage(jid, { text: 'Enter a valid bet.' })
            if (bet > 1000000)
                return sock.sendMessage(jid, { text: 'Max bet is 1,000,000.' })
            if (player.gold < bet)
                return sock.sendMessage(jid, { text: 'Not enough gold.' })

            player.gold -= bet
            const symbols = ['🍒', '🍀', '💰']
            const roll = [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ]

            let win = 0
            if (Math.random() < 0.05) {
                win = 1000000000
            } else if (roll[0] === roll[1] && roll[1] === roll[2]) {
                win = bet * 5
            } else if (roll[0] === roll[1] || roll[1] === roll[2] || roll[0] === roll[2]) {
                win = bet * 2
            }

            player.gold += win
            await savePlayer(player)
            await sock.sendMessage(jid, {
                text: `🎰 SLOT MACHINE 🎰\n\n${roll.join(' ')}\n\n${win > 0 ? `You won ${win} gold` : 'You lost.'}`
            })
            break
        }

        case 'rob': {
            if (!msg.message.extendedTextMessage?.contextInfo?.mentionedJid)
                return sock.sendMessage(jid, { text: 'Mention a target.' })
            const targetId = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
            if (targetId === sender)
                return sock.sendMessage(jid, { text: 'You cannot rob yourself.' })
            const target = await getPlayer(targetId)
            if (!target.gold || target.gold <= 0)
                return sock.sendMessage(jid, { text: 'Target has no gold.' })
            if (hasCharm(target, 'protection_charm')) {
                return sock.sendMessage(jid, { text: '🛡️ Rob failed. Target is protected.' })
            }
            const success = Math.random() < 0.5
            if (!success) return sock.sendMessage(jid, { text: 'Rob failed.' })

            const amount = Math.floor(target.gold * 0.2)
            target.gold -= amount
            player.gold += amount
            await savePlayer(player)
            await savePlayer(target)
            await sock.sendMessage(jid, { text: `💰 You stole ${amount} gold from ${target.username}` })
            break
        }

        case 'work': {
            if (!player.equipment.work)
                return sock.sendMessage(jid, { text: 'You need a work uniform from the store to work.' })
            let basePay = Math.floor(Math.random() * 5000) + 1000
            if (hasCharm(player, 'gold_charm')) basePay *= 2
            player.gold += basePay
            await savePlayer(player)
            await sock.sendMessage(jid, { text: `💼 You worked and earned ${basePay} gold.` })
            break
        }

        case 'mine': {
            if (!player.equipment.mining)
                return sock.sendMessage(jid, { text: 'You need a pickaxe from the store to mine.' })
            const gems = ['coal', 'iron', 'gold', 'diamond']
            const gemWeights = [50, 30, 15, 5]
            let totalWeight = gemWeights.reduce((a, b) => a + b, 0)
            let rand = Math.random() * totalWeight
            let gemIndex = 0
            for (let i = 0; i < gems.length; i++) {
                if (rand < gemWeights[i]) { gemIndex = i; break }
                rand -= gemWeights[i]
            }
            const gem = gems[gemIndex]
            addItem(player, gem, 1)
            await savePlayer(player)
            await sock.sendMessage(jid, { text: `⛏️ You mined a ${gem}!` })
            break
        }

        case 'fish': {
            if (!player.equipment.fishing)
                return sock.sendMessage(jid, { text: 'You need a fishing rod from the store to fish.' })
            const fishTypes = ['salmon', 'tuna', 'golden_fish']
            const fishWeights = [60, 30, 10]
            let total = fishWeights.reduce((a, b) => a + b, 0)
            let rand = Math.random() * total
            let index = 0
            for (let i = 0; i < fishTypes.length; i++) {
                if (rand < fishWeights[i]) { index = i; break }
                rand -= fishWeights[i]
            }
            const fish = fishTypes[index]
            addItem(player, fish, 1)
            await savePlayer(player)
            await sock.sendMessage(jid, { text: `🎣 You caught a ${fish}!` })
            break
        }

        case 'sell-gem': {
            const gemName = args[0]
            if (!gemName) return sock.sendMessage(jid, { text: 'Specify a gem or fish to sell.' })
            if (!player.inventory[gemName] || player.inventory[gemName] <= 0)
                return sock.sendMessage(jid, { text: 'You do not have that item.' })
            const prices = { coal: 1000, iron: 5000, gold: 10000, diamond: 50000, salmon: 500, tuna: 1000, golden_fish: 10000 }
            const sellPrice = prices[gemName] || 100
            player.inventory[gemName] -= 1
            player.gold += sellPrice
            await savePlayer(player)
            await sock.sendMessage(jid, { text: `💰 You sold 1 ${gemName} for ${sellPrice} gold.` })
            break
        }

        case 'acceptquest': {
            if (!guild) return sock.sendMessage(jid, { text: 'You are not in a guild.' })
            const quest = guild.activeQuest
            if (!quest) return sock.sendMessage(jid, { text: 'No active quest in this guild.' })
            if (quest.assignedTo) return sock.sendMessage(jid, { text: 'Quest already taken.' })
            quest.assignedTo = sender
            quest.currentFloor = 0
            await saveGuild(guild)
            await sock.sendMessage(jid, { text: `✅ You accepted the guild quest: ${quest.description}` })
            break
        }

        case 'dungeon-battle': {
            if (!guild) return sock.sendMessage(jid, { text: 'You are not in a guild.' })
            const quest = guild.activeQuest
            if (!quest || quest.type !== 'dungeon') return sock.sendMessage(jid, { text: 'No active dungeon quest.' })
            if (quest.assignedTo !== sender) return sock.sendMessage(jid, { text: 'Quest not assigned to you.' })

            // Mock dragon for floor
            const baseDragon = { name: 'Floor Guardian', hp: 100, attack: 10, defense: 5, moves: [{ name: 'Fire Breath', damage: 20 }] }
            const scaledDragon = scaleDragonForDungeon(baseDragon, quest)

            const victory = await battleEngine(player, scaledDragon)
            if (victory) {
                await sock.sendMessage(jid, { text: `⚔️ You defeated the Floor Guardian!` })
                await onDungeonFloorClear(player, guild, sock)
            } else {
                await sock.sendMessage(jid, { text: `💀 You were defeated by the Floor Guardian.` })
            }
            break
        }

        default:
            // await sock.sendMessage(jid, { text: 'Unknown command.' })
            break
    }
}

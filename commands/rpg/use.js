import { getPlayerProfile, updatePlayer } from '../../utils/rpg_user_manager.js';
import DB from '../../utils/database.js';

export default {
    name: 'use',
    description: 'Use an item from your bag.',
    async execute({ sender, reply, args }) {
        if (!args[0]) return reply('❌ Specify the item number to use. Example: *=use 1*');

        const index = parseInt(args[0]) - 1;
        if (isNaN(index)) return reply('❌ Invalid item number.');

        const player = await getPlayerProfile(sender);
        if (!player) return reply('❌ Player profile not found.');

        let itemName = '';
        let quantity = 0;
        const items = player.inventory?.items || {};
        const itemNames = Object.keys(items);

        if (index < 0 || index >= itemNames.length) {
            // Fallback for array-based inventory if any
            if (Array.isArray(player.inventory) && index >= 0 && index < player.inventory.length) {
                itemName = player.inventory[index].name;
                quantity = player.inventory[index].quantity;
            } else {
                return reply('❌ Item number out of range.');
            }
        } else {
            itemName = itemNames[index];
            quantity = items[itemName];
        }

        const usersDb = await DB.getDB('users');
        const session = usersDb.sessions?.[sender];
        const inBattle = session?.inBattle;

        let effectText = '';
        let itemConsumed = true;

        // --- Item Logic ---
        if (itemName.includes('Potion')) {
            const restore = itemName.includes('Super') ? 250 : 100;
            if (inBattle) {
                // Battle context use
                const activeDragonIndex = session.activeDragonIndex || 0;
                const dragon = player.dragons[activeDragonIndex];
                const oldHp = dragon.hp;
                dragon.hp = Math.min(dragon.maxHp || 100, dragon.hp + restore);
                effectText = `💊 You used *${itemName}* and restored ${dragon.hp - oldHp} HP to *${dragon.name}*! (Current HP: ${dragon.hp})`;
            } else {
                // Out of battle use
                if (player.dragons && player.dragons.length > 0) {
                    player.dragons[0].hp = Math.min(player.dragons[0].maxHp || 100, player.dragons[0].hp + restore);
                    effectText = `💊 You used *${itemName}* on *${player.dragons[0].name}*.`;
                } else {
                    effectText = `💊 You used *${itemName}*, but you have no dragons.`;
                }
            }
        } else if (itemName.startsWith('Colossal Beast Trap')) {
            if (!inBattle || !session.isColossal) {
                return reply(`❌ You can only use this trap on the corresponding Colossal Beast during battle.`);
            }

            const beastIdStr = itemName.split('Beast ')[1];
            // Match name or id
            if (!session.wildDragon.id.includes(beastIdStr) && !session.wildDragon.name.includes(beastIdStr)) {
                 return reply(`❌ This trap is not for *${session.wildDragon.name}*.`);
            }

            effectText = `🎯 You used *${itemName}* and successfully captured the Colossal Beast *${session.wildDragon.name}*!`;

            // Victory logic
            const { handleColossalBeastVictory } = await import('../../utils/colossal_rewards.js');
            const { defeatBeast } = await import('../../utils/colossal_manager.js');
            const { battleContextStore } = await import('../../utils/battle_manager.js');

            const rewardMsg = await handleColossalBeastVictory(sender, session.wildDragon);
            await defeatBeast();

            delete battleContextStore[sender];
            delete usersDb.sessions[sender];

            effectText += `\n\n` + rewardMsg;
        } else if (itemName.includes('Trap')) {
            if (inBattle && session.opponent === 'WILD' && !session.isColossal) {
                const successRate = itemName.includes('Legendary') ? 90 : itemName.includes('Epic') ? 70 : 50;
                if (Math.random() * 100 < successRate) {
                    effectText = `🎯 You used *${itemName}* and captured *${session.wildDragon.name}*!`;
                    session.captured = true;
                    session.victory = true;
                } else {
                    effectText = `❌ *${itemName}* failed to capture *${session.wildDragon.name}*.`;
                }
            } else {
                return reply(`❌ You can't use traps here.`);
            }
        } else {
            effectText = `✨ You used *${itemName}* and applied its effect.`;
        }

        // --- Post-Use Update ---
        if (itemConsumed) {
            if (items[itemName]) {
                items[itemName]--;
                if (items[itemName] <= 0) delete items[itemName];
            } else if (Array.isArray(player.inventory)) {
                player.inventory[index].quantity--;
                if (player.inventory[index].quantity <= 0) player.inventory.splice(index, 1);
            }
        }

        await updatePlayer(player);
        await DB.saveDB('users'); // Save session changes too

        return reply(effectText);
    }
};

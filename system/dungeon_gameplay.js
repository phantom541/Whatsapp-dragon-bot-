import DB from "../utils/database.js";
import { getActiveDungeon } from "./dungeon_spawner.js";
import { addXP } from "../utils/economy.js";

// Check if player can enter dungeon
export async function canEnterDungeon(jid) {
  const db = await DB.getDB('users');
  const player = db.users[jid];
  if (!player) return false;

  // Basic check: at least one dragon with HP > 0
  if (!player.dragons || player.dragons.length === 0) return false;
  const aliveDragon = player.dragons.find(d => d.hp > 0);
  if (!aliveDragon) return false;

  return true;
}

// Start dungeon run session for a player
export async function enterDungeon(groupId, jid) {
  const dungeon = await getActiveDungeon(groupId);
  if (!dungeon) return { ok: false, message: "No active dungeon in this group." };

  if (!(await canEnterDungeon(jid))) {
    return { ok: false, message: "You are not ready to enter the dungeon. (Make sure your dragons are healed!)" };
  }

  // Update dungeon players list
  if (!dungeon.players.includes(jid)) {
    dungeon.players.push(jid);
    const db = await DB.getDB('dungeons');
    // Find and update the dungeon in the list
    const dIdx = db[groupId].findIndex(d => d.id === dungeon.id);
    if (dIdx !== -1) {
        db[groupId][dIdx] = dungeon;
        await DB.saveDB('dungeons');
    }
  }

  return { ok: true, dungeon };
}

// Note: The actual "fightFloor" logic will be integrated into the %explore command
// which already handles monster spawning and HP tracking via battles.
// This module will focus on progression and rewards.

export async function clearDungeonFloor(groupId, dungeonId) {
    const db = await DB.getDB('dungeons');
    const dungeon = db[groupId]?.find(d => d.id === dungeonId);
    if (!dungeon) return null;

    dungeon.currentFloor++;
    await DB.saveDB('dungeons');
    return dungeon;
}

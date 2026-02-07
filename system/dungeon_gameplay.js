import DB from "../utils/database.js";
import { getActiveDungeon } from "./dungeon_spawner.js";
import { addXP } from "../utils/economy.js";

// Check if player can enter dungeon
export async function canEnterDungeon(jid) {
  const db = await DB.getDB('users');
  const player = db.users[jid];
  if (!player) return false;

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
    const dIdx = db[groupId].findIndex(d => d.id === dungeon.id);
    if (dIdx !== -1) {
        db[groupId][dIdx] = dungeon;
        await DB.saveDB('dungeons');
    }
  }

  return { ok: true, dungeon };
}

export async function checkFloorProgression(groupId, dungeonId) {
    const db = await DB.getDB('dungeons');
    const dungeon = db[groupId]?.find(d => d.id === dungeonId);
    if (!dungeon || dungeon.status !== 'active') return null;

    const monstersThisFloor = dungeon.monstersDefeated % dungeon.monstersPerFloor;

    // If we just defeated the last monster of the floor
    if (dungeon.monstersDefeated > 0 && monstersThisFloor === 0) {
        if (dungeon.currentFloor < dungeon.maxFloors) {
            dungeon.currentFloor++;
            await DB.saveDB('dungeons');
            return { type: 'floor_cleared', floor: dungeon.currentFloor - 1, nextFloor: dungeon.currentFloor };
        } else {
            // Reached final floor, time for boss?
            // In our current explore logic, boss is a chance or guaranteed at 15 monsters.
            // Let's refine that in explore.js
        }
    }
    return null;
}

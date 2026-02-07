import { recordDungeonRaid } from './dungeon_logger.js';
import { getPlayerProfile, updatePlayer } from './rpg_user_manager.js';
import { DUNGEON_MONSTERS } from '../data/monsters.js';
import { DUNGEON_BOSSES } from '../data/dungeon_bosses.js';

// Dungeon definitions
export const DUNGEONS = [
  { name: "Hatchling Cavern", difficulty: "easy", floors: 10 },
  { name: "Molten Chasm", difficulty: "nice", floors: 10 },
  { name: "Twilight Ruins", difficulty: "normal", floors: 10 },
  { name: "Stormspire", difficulty: "hard", floors: 10 },
  { name: "Oblivion Depths", difficulty: "extreme", floors: 10 },
  { name: "Chaos Fortress", difficulty: "crazy", floors: 10 },
  { name: "Nightmare Citadel", difficulty: "nightmare", floors: 10 }
];

// Titles based on dungeon achievements
export const DUNGEON_TITLES = [
  { floor: 1, title: "Novice Delver" },
  { floor: 3, title: "Dungeon Explorer" },
  { floor: 5, title: "Monster Slayer" },
  { floor: 7, title: "Boss Hunter" },
  { floor: 10, title: "Dungeon Master" }
];

// --- Generate random monsters for a dungeon floor ---
export function getMonstersForFloor(dungeonDifficulty, floorNumber) {
    const allMonsters = DUNGEON_MONSTERS;
    return allMonsters
      .sort(() => 0.5 - Math.random())
      .slice(0, 3); // 3 monsters per floor
}

// --- Get boss for dungeon ---
export function getBossForDungeon(dungeonName) {
    const dungeon = DUNGEONS.find(d => d.name === dungeonName);
    if (!dungeon) return null;
    return DUNGEON_BOSSES[dungeon.difficulty.toLowerCase()];
}

// --- Run a dungeon raid ---
export async function runDungeonRaid(playerJid, dungeonName) {
    const player = await getPlayerProfile(playerJid);
    if(!player) throw new Error("Player not found");

    const dungeon = DUNGEONS.find(d => d.name === dungeonName);
    if(!dungeon) throw new Error("Dungeon not found");

    const monstersDefeated = [];
    for(let floor = 1; floor <= dungeon.floors; floor++){
        const floorMonsters = getMonstersForFloor(dungeon.difficulty, floor);
        monstersDefeated.push(...floorMonsters.map(m => m.name));
    }

    const boss = getBossForDungeon(dungeon.name);
    const bossesDefeated = boss ? [boss.name] : [];

    // Example rewards scaling by difficulty
    const rewardGold = dungeon.floors * (boss ? 500 : 250);
    const rewardXP = dungeon.floors * (boss ? 300 : 150);

    player.progression.gold += rewardGold;
    player.progression.xp += rewardXP;

    // Assign title based on floors completed
    const titleObj = DUNGEON_TITLES.find(t => t.floor === dungeon.floors);
    if(titleObj){
        if(!player.achievements) player.achievements = [];
        if(!player.achievements.includes(titleObj.title)){
            player.achievements.push(titleObj.title);
        }
    }

    // save current player state
    await updatePlayer(player);

    // Record raid
    const raidLog = await recordDungeonRaid({
        playerJid,
        dungeonName: dungeon.name,
        difficulty: dungeon.difficulty,
        monstersDefeated,
        bossesDefeated,
        rewards: { gold: rewardGold, xp: rewardXP, items: [] }
    });

    return raidLog;
}

import { DUNGEON_BOSSES } from "../data/dungeon_bosses.js";
import DB from "../utils/database.js";

export async function spawnDungeon(groupId) {
  const difficulties = Object.keys(DUNGEON_BOSSES);
  const chosenDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const bossTemplate = DUNGEON_BOSSES[chosenDifficulty];

  // Deep clone boss to avoid modifying template
  const boss = JSON.parse(JSON.stringify(bossTemplate));

  const dungeon = {
    id: Date.now(),
    groupId: groupId,
    difficulty: chosenDifficulty,
    boss,
    status: 'active',
    currentFloor: 1,
    maxFloors: 10,
    monstersDefeated: 0,
    monstersPerFloor: 5,
    players: [], // Track players currently in the dungeon
    startedAt: Date.now()
  };

  // Save dungeon to DB
  const db = await DB.getDB('dungeons');
  db[groupId] = db[groupId] || [];

  // Only allow one active dungeon per group
  const activeDungeonIdx = db[groupId].findIndex(d => d.status === 'active');
  if (activeDungeonIdx !== -1) {
    return { error: 'A dungeon is already active in this group!' };
  }

  db[groupId].push(dungeon);
  await DB.saveDB('dungeons');

  return dungeon;
}

export async function getActiveDungeon(groupId) {
  const db = await DB.getDB('dungeons');
  if (!db[groupId]) return null;
  return db[groupId].find(d => d.status === 'active') || null;
}

export async function closeDungeon(groupId, dungeonId) {
  const db = await DB.getDB('dungeons');
  if (!db[groupId]) return;
  const dungeon = db[groupId].find(d => d.id === dungeonId);
  if (dungeon) {
    dungeon.status = 'completed';
    await DB.saveDB('dungeons');
  }
}

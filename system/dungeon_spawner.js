import { DUNGEON_MONSTERS } from '../data/monsters.js';
import { DUNGEON_BOSSES } from '../data/dungeon_bosses.js';
import DB from '../utils/database.js';

/**
 * Spawn monsters for a dungeon floor based on difficulty
 */
export function spawnDungeonFloor(floor, difficulty) {
  const monsterCountMap = {
    easy: 3,
    nice: 4,
    normal: 5,
    hard: 6,
    extreme: 7,
    crazy: 8,
    nightmare: 9
  };
  const monsterCount = monsterCountMap[difficulty.toLowerCase()] || 5;

  // For simplicity, we'll pick from all monsters and scale stats later if needed
  // or use level-based filtering if we added levels to monsters.
  // Since we don't have explicit levels on monsters in the latest list,
  // we'll just pick random ones.
  const monsters = [];
  for (let i = 0; i < monsterCount; i++) {
    const mTemplate = DUNGEON_MONSTERS[Math.floor(Math.random() * DUNGEON_MONSTERS.length)];
    const m = JSON.parse(JSON.stringify(mTemplate));
    m.currentHp = m.stats.hp;
    m.floor = floor;
    monsters.push(m);
  }

  // Pick boss for the floor
  const bossTemplate = DUNGEON_BOSSES[difficulty.toLowerCase()] || DUNGEON_BOSSES.normal;
  const boss = JSON.parse(JSON.stringify(bossTemplate));
  boss.currentHp = boss.hp;
  boss.floor = floor;

  return { monsters, boss };
}

export async function spawnDungeon(groupId) {
  const difficulties = Object.keys(DUNGEON_BOSSES);
  const chosenDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

  const floor1 = spawnDungeonFloor(1, chosenDifficulty);

  const dungeon = {
    id: Date.now(),
    groupId: groupId,
    difficulty: chosenDifficulty,
    status: 'active',
    floor: 1,
    maxFloors: 10,
    monstersRemaining: floor1.monsters,
    floorBoss: floor1.boss,
    players: [],
    startedAt: Date.now()
  };

  const db = await DB.getDB('dungeons');
  db[groupId] = db[groupId] || [];

  // Close any existing active dungeon
  db[groupId].forEach(d => { if (d.status === 'active') d.status = 'abandoned'; });

  db[groupId].push(dungeon);
  await DB.saveDB('dungeons');

  return dungeon;
}

export async function getActiveDungeon(groupId) {
  const db = await DB.getDB('dungeons');
  if (!db[groupId]) return null;
  return db[groupId].find(d => d.status === 'active') || null;
}

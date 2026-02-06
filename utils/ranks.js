export const RANKS = [
  { name: '🌱 Hatchling', daily: 500 },
  { name: '🐣 Shellbreaker', daily: 650 },
  { name: '🪶 Ember-Touched', daily: 800 },
  { name: '🔥 Flame Adept', daily: 950 },
  { name: '🔥🔥 Blaze Initiate', daily: 1100 },

  { name: '🐉 Wyrmling', daily: 1300 },
  { name: '🐉 Scale-Bearer', daily: 1550 },
  { name: '🛡️ Drake Guard', daily: 1800 },
  { name: '⚔️ Firebound Knight', daily: 2100 },
  { name: '🏹 Ash Vanguard', daily: 2450 },

  { name: '👑 Dragonbound Noble', daily: 2850 },
  { name: '🜂 Pyre Lord', daily: 3300 },
  { name: '🌋 Magma Sovereign', daily: 3800 },
  { name: '🩸 Bloodflame Champion', daily: 4350 },
  { name: '💠 Elder Wyrm', daily: 5000 },

  { name: '🌌 Astral Dragon', daily: 5750 },
  { name: '🜁 Voidscale Paragon', daily: 6600 },
  { name: '💎 Mythic Ascendant', daily: 7600 },
  { name: '🌠 Worldrender', daily: 8800 },

  { name: '🐲 Eternal Dragonlord', daily: 10000 }
];

export function getRankData(rankName) {
  return RANKS.find(r => r.name === rankName) || RANKS[0];
}

export function getDefaultRank() {
  return RANKS[0].name;
}

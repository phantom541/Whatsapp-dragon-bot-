export const RANKS = [
  { name: '🌱 Hatchling', daily: 500, xp: 0 },
  { name: '🐣 Shellbreaker', daily: 650, xp: 500 },
  { name: '🪶 Ember-Touched', daily: 800, xp: 1200 },
  { name: '🔥 Flame Adept', daily: 950, xp: 2200 },
  { name: '🔥🔥 Blaze Initiate', daily: 1100, xp: 3500 },

  { name: '🐉 Wyrmling', daily: 1300, xp: 5000 },
  { name: '🐉 Scale-Bearer', daily: 1550, xp: 7000 },
  { name: '🛡️ Drake Guard', daily: 1800, xp: 9500 },
  { name: '⚔️ Firebound Knight', daily: 2100, xp: 12500 },
  { name: '🏹 Ash Vanguard', daily: 2450, xp: 16000 },

  { name: '👑 Dragonbound Noble', daily: 2850, xp: 20000 },
  { name: '🜂 Pyre Lord', daily: 3300, xp: 25000 },
  { name: '🌋 Magma Sovereign', daily: 3800, xp: 31000 },
  { name: '🩸 Bloodflame Champion', daily: 4350, xp: 38000 },
  { name: '💠 Elder Wyrm', daily: 5000, xp: 46000 },

  { name: '🌌 Astral Dragon', daily: 5750, xp: 55000 },
  { name: '🜁 Voidscale Paragon', daily: 6600, xp: 65000 },
  { name: '💎 Mythic Ascendant', daily: 7600, xp: 76000 },
  { name: '🌠 Worldrender', daily: 8800, xp: 88000 },

  { name: '🐲 Eternal Dragonlord', daily: 10000, xp: 101000 }
];

export function getRankData(rankName) {
  return RANKS.find(r => r.name === rankName) || RANKS[0];
}

export function getDefaultRank() {
  return RANKS[0].name;
}

export function getRankIndex(rankName) {
  return RANKS.findIndex(r => r.name === rankName);
}

export function getRankForXP(xp) {
  // Find the highest rank where xp requirement is met
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xp) {
      return RANKS[i].name;
    }
  }
  return RANKS[0].name;
}

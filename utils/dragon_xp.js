export const MAX_DRAGON_LEVEL = 100;

// XP required to go from level → level+1
export function xpForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.35));
}

// Total XP needed to reach a level
export function totalXpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

import { scaleStats } from './dragon_stats.js';

export function grantDragonXP(dragon, xpGained) {
  dragon.xp = dragon.xp || 0;
  dragon.level = dragon.level || 1;

  dragon.xp += xpGained;

  let leveledUp = false;
  while (
    dragon.level < MAX_DRAGON_LEVEL &&
    dragon.xp >= xpForLevel(dragon.level)
  ) {
    dragon.xp -= xpForLevel(dragon.level);
    dragon.level += 1;
    scaleStats(dragon);
    leveledUp = true;
  }
  return leveledUp;
}

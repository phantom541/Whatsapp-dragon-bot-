export const SPAWN_CONFIG = {
  wild: {
    minInterval: 30 * 60 * 1000,
    maxInterval: 60 * 60 * 1000,
    lifetime: 90 * 1000
  },
  rare: {
    minInterval: 6 * 60 * 60 * 1000,
    maxInterval: 12 * 60 * 60 * 1000,
    lifetime: 180 * 1000
  }
};

export const RARITY_WEIGHTS = [
  { rarity: 'Common', weight: 55, level: 1 },
  { rarity: 'Uncommon', weight: 25, level: 2 },
  { rarity: 'Rare', weight: 12, level: 3 },
  { rarity: 'Epic', weight: 6, level: 4 },
  { rarity: 'Legendary', weight: 1.5, level: 5 },
  { rarity: 'Mythic', weight: 0.5, level: 6 }
];

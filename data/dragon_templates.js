export const STARTER_DRAGONS = [
  {
    name: 'Cinderling',
    type: 'Fire',
    species: 'Wyvern',
    rarity: 'Common',
    baseHp: 35,
    baseAtk: 8,
    baseDef: 5,
    element: 'Fire',
    image: 'https://placehold.co/600x400?text=Cinderling',
    moves: [
      { name: 'Ember', power: 20, cost: 2 },
      { name: 'Scratch', power: 15, cost: 1 }
    ]
  },
  {
    name: 'Pebblewyrm',
    type: 'Earth',
    species: 'Drake',
    rarity: 'Common',
    baseHp: 40,
    baseAtk: 6,
    baseDef: 7,
    element: 'Earth',
    image: 'https://placehold.co/600x400?text=Pebblewyrm',
    moves: [
      { name: 'Rock Throw', power: 20, cost: 2 },
      { name: 'Tackle', power: 15, cost: 1 }
    ]
  },
  {
    name: 'Mistscale',
    type: 'Water',
    species: 'Drake',
    rarity: 'Common',
    baseHp: 38,
    baseAtk: 7,
    baseDef: 6,
    element: 'Water',
    image: 'https://placehold.co/600x400?text=Mistscale',
    moves: [
      { name: 'Water Gun', power: 20, cost: 2 },
      { name: 'Tail Whip', power: 10, cost: 1 }
    ]
  },
  {
    name: 'Breezeling',
    type: 'Air',
    species: 'Fairy',
    rarity: 'Common',
    baseHp: 32,
    baseAtk: 9,
    baseDef: 4,
    element: 'Air',
    image: 'https://placehold.co/600x400?text=Breezeling',
    moves: [
      { name: 'Gust', power: 20, cost: 2 },
      { name: 'Peck', power: 15, cost: 1 }
    ]
  },
  {
    name: 'Sparklet',
    type: 'Lightning',
    species: 'Drake',
    rarity: 'Common',
    baseHp: 30,
    baseAtk: 10,
    baseDef: 3,
    element: 'Lightning',
    image: 'https://placehold.co/600x400?text=Sparklet',
    moves: [
      { name: 'Thunder Shock', power: 20, cost: 2 },
      { name: 'Quick Attack', power: 15, cost: 1 }
    ]
  },
  {
    name: 'Frostbit',
    type: 'Ice',
    species: 'Drake',
    rarity: 'Common',
    baseHp: 36,
    baseAtk: 7,
    baseDef: 6,
    element: 'Ice',
    image: 'https://placehold.co/600x400?text=Frostbit',
    moves: [
      { name: 'Powder Snow', power: 20, cost: 2 },
      { name: 'Lick', power: 10, cost: 1 }
    ]
  }
];

export const ALL_DRAGONS = [
  ...STARTER_DRAGONS,
  {
    id: 'd001',
    name: 'Emberwing',
    type: 'Fire',
    species: 'Wyvern',
    rarity: 'S',
    level: 5,
    baseHp: 80, baseAtk: 25, baseDef: 15, element: 'Fire',
    moves: [
      { name: 'Flame Bite', power: 50, cost: 5 },
      { name: 'Fire Tail', power: 40, cost: 4 },
      { name: 'Heat Wave', power: 60, cost: 6 },
      { name: 'Scorch', power: 55, cost: 5 },
      { name: 'Blaze Rush', power: 65, cost: 6 },
      { name: 'Inferno Fang', power: 70, cost: 7 },
      { name: 'Dragon Roar', power: 30, cost: 3 },
      { name: 'Wing Slash', power: 35, cost: 3 },
      { name: 'Fireball', power: 50, cost: 5 },
      { name: 'Heat Strike', power: 45, cost: 4 },
      { name: 'Pyro Burst', power: 60, cost: 6 },
      { name: 'Ember Shot', power: 40, cost: 4 },
      { name: 'Solar Flare', power: 80, cost: 8 }
    ],
    image: 'https://cdn.pixabay.com/photo/2017/01/31/22/16/dragon-2029305_1280.png'
  },
  {
    id: 'd002',
    name: 'Frostscale',
    type: 'Ice',
    species: 'Drake',
    rarity: 'Rare',
    level: 4,
    baseHp: 85, baseAtk: 20, baseDef: 20, element: 'Ice',
    moves: [
      { name: 'Ice Fang', power: 50, cost: 5 },
      { name: 'Frost Breath', power: 60, cost: 6 },
      { name: 'Chill Slash', power: 45, cost: 4 },
      { name: 'Glacial Roar', power: 30, cost: 3 },
      { name: 'Snowstorm', power: 55, cost: 5 },
      { name: 'Icicle Shot', power: 50, cost: 5 },
      { name: 'Blizzard Bite', power: 70, cost: 7 },
      { name: 'Frozen Tail', power: 35, cost: 3 },
      { name: 'Cryo Strike', power: 60, cost: 6 },
      { name: 'Arctic Wing', power: 40, cost: 4 },
      { name: 'Glacier Smash', power: 65, cost: 6 },
      { name: 'Hailstorm', power: 55, cost: 5 },
      { name: 'Frost Nova', power: 80, cost: 8 }
    ],
    image: 'https://cdn.pixabay.com/photo/2013/07/12/15/25/dragon-147017_1280.png'
  },
  {
    id: 'd003',
    name: 'Thunderclaw',
    type: 'Electric',
    species: 'Drake',
    rarity: 'Uncommon',
    level: 4,
    baseHp: 75, baseAtk: 28, baseDef: 12, element: 'Lightning',
    moves: [
      { name: 'Spark Bite', power: 50, cost: 5 },
      { name: 'Lightning Strike', power: 60, cost: 6 },
      { name: 'Volt Tail', power: 45, cost: 4 },
      { name: 'Thunder Roar', power: 30, cost: 3 },
      { name: 'Electro Punch', power: 55, cost: 5 },
      { name: 'Shockwave', power: 50, cost: 5 },
      { name: 'Static Charge', power: 70, cost: 7 },
      { name: 'Plasma Claw', power: 35, cost: 3 },
      { name: 'Chain Lightning', power: 60, cost: 6 },
      { name: 'Thunderbolt', power: 40, cost: 4 },
      { name: 'Storm Slash', power: 65, cost: 6 },
      { name: 'Electric Surge', power: 55, cost: 5 },
      { name: 'Lightning Nova', power: 80, cost: 8 }
    ],
    image: 'https://cdn.pixabay.com/photo/2018/08/18/22/50/dragon-3615533_1280.png'
  },
  {
    id: 'd004',
    name: 'Stonejaw',
    type: 'Earth',
    species: 'Gargoyle',
    rarity: 'Common',
    level: 3,
    baseHp: 90, baseAtk: 18, baseDef: 25, element: 'Earth',
    moves: [
      { name: 'Rock Bite', power: 50, cost: 5 },
      { name: 'Stone Tail', power: 40, cost: 4 },
      { name: 'Earthquake', power: 60, cost: 6 },
      { name: 'Rock Throw', power: 55, cost: 5 },
      { name: 'Sandstorm', power: 65, cost: 6 },
      { name: 'Crush', power: 70, cost: 7 },
      { name: 'Boulder Smash', power: 30, cost: 3 },
      { name: 'Earth Roar', power: 35, cost: 3 },
      { name: 'Mud Slide', power: 50, cost: 5 },
      { name: 'Rock Slam', power: 45, cost: 4 },
      { name: 'Stone Spike', power: 60, cost: 6 },
      { name: 'Quake', power: 40, cost: 4 },
      { name: 'Terra Crush', power: 80, cost: 8 }
    ],
    image: 'https://cdn.pixabay.com/photo/2016/11/29/05/08/dragon-1868005_1280.png'
  },
  {
    id: 'd005',
    name: 'Shadowfang',
    type: 'Dark',
    species: 'Wyvern',
    rarity: 'Rare',
    level: 4,
    baseHp: 82, baseAtk: 30, baseDef: 10, element: 'Shadow',
    moves: [
      { name: 'Night Bite', power: 50, cost: 5 },
      { name: 'Shadow Claw', power: 60, cost: 6 },
      { name: 'Dark Roar', power: 45, cost: 4 },
      { name: 'Phantom Slash', power: 30, cost: 3 },
      { name: 'Umbral Strike', power: 55, cost: 5 },
      { name: 'Shadow Tail', power: 50, cost: 5 },
      { name: 'Dusk Fang', power: 70, cost: 7 },
      { name: 'Nightmare', power: 35, cost: 3 },
      { name: 'Eclipse', power: 60, cost: 6 },
      { name: 'Void Swipe', power: 40, cost: 4 },
      { name: 'Dark Pulse', power: 65, cost: 6 },
      { name: 'Oblivion Strike', power: 55, cost: 5 },
      { name: 'Shadow Nova', power: 80, cost: 8 }
    ],
    image: 'https://cdn.pixabay.com/photo/2018/02/15/19/04/dragon-3158337_1280.png'
  },
  {
    id: 'd006',
    name: 'Blaze Wyrm',
    type: 'Fire',
    rarity: 'Uncommon',
    baseHp: 60, baseAtk: 15, baseDef: 10, element: 'Fire',
    image: 'https://placehold.co/600x400?text=Blaze+Wyrm',
    moves: [{ name: 'Fire Blast', power: 40, cost: 4 }]
  },
  {
    id: 'd007',
    name: 'Aqua Drake',
    type: 'Water',
    rarity: 'Uncommon',
    baseHp: 65, baseAtk: 12, baseDef: 12, element: 'Water',
    image: 'https://placehold.co/600x400?text=Aqua+Drake',
    moves: [{ name: 'Hydro Pump', power: 40, cost: 4 }]
  },
  {
    id: 'd008',
    name: 'Storm King',
    type: 'Lightning',
    rarity: 'Rare',
    baseHp: 100, baseAtk: 25, baseDef: 15, element: 'Lightning',
    image: 'https://placehold.co/600x400?text=Storm+King',
    moves: [{ name: 'Thunder Bolt', power: 45, cost: 4 }]
  },
  {
    id: 'd009',
    name: 'Iron Titan',
    type: 'Metal',
    rarity: 'Rare',
    baseHp: 150, baseAtk: 10, baseDef: 30, element: 'Metal',
    image: 'https://placehold.co/600x400?text=Iron+Titan',
    moves: [{ name: 'Iron Tail', power: 30, cost: 3 }]
  },
  {
    id: 'd010',
    name: 'Shadow Stalker',
    type: 'Shadow',
    rarity: 'Epic',
    baseHp: 120, baseAtk: 40, baseDef: 10, element: 'Shadow',
    image: 'https://placehold.co/600x400?text=Shadow+Stalker',
    moves: [{ name: 'Dark Pulse', power: 50, cost: 5 }]
  },
  {
    id: 'd011',
    name: 'Solar Flare',
    type: 'Light',
    rarity: 'Legendary',
    baseHp: 200, baseAtk: 50, baseDef: 40, element: 'Light',
    image: 'https://placehold.co/600x400?text=Solar+Flare',
    moves: [{ name: 'Solar Beam', power: 70, cost: 7 }]
  },
  {
    id: 'd012',
    name: 'Void Render',
    type: 'Void',
    rarity: 'Mythic',
    baseHp: 500, baseAtk: 100, baseDef: 100, element: 'Void',
    image: 'https://placehold.co/600x400?text=Void+Render',
    moves: [{ name: 'Void Slash', power: 100, cost: 10 }]
  }
];

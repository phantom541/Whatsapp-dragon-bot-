export const COLOSSAL_BEASTS = [
  {
    id: "cb1",
    name: "Shohoku the Ravager",
    image: "https://cdn.example.com/shangri-la/shohoku.png",
    type: "Fire/Dragon",
    level: 200,
    maxHp: 50000,
    hp: 50000,
    moves: [
      "Inferno Roar",
      "Dragon Tail Sweep",
      "Flame Breath",
      "Wing Gust",
      "Scale Barrage",
      "Lava Eruption",
      "Earthquake Slam",
      "Roaring Charge",
      "Blazing Aura"
    ],
    weaknesses: ["Water", "Ice"],
    raidReward: { gold: 5000, xp: 2000, title: "Colossal Vanquisher" }
  },
  {
    id: "cb2",
    name: "Kurokami the Abyssal",
    image: "https://cdn.example.com/shangri-la/kurokami.png",
    type: "Dark/Water",
    level: 210,
    maxHp: 55000,
    hp: 55000,
    moves: [
      "Abyssal Wave",
      "Shadow Claw",
      "Tidal Roar",
      "Nightmare Fang",
      "Dark Pulse",
      "Whirlpool",
      "Abyssal Grasp",
      "Shadow Step",
      "Ocean Crush"
    ],
    weaknesses: ["Electric", "Grass"],
    raidReward: { gold: 5500, xp: 2300, title: "Abyss Conqueror" }
  },
  {
    id: "cb3",
    name: "Siegwurm the Sky Ruler",
    image: "https://static.wikia.nocookie.net/shangrila-frontier/images/a/a0/Siegwurm_Artwork.png",
    type: "Dragon/Flying",
    level: 220,
    maxHp: 58000,
    hp: 58000,
    moves: [
      "Sky Roar",
      "Dragon Dive",
      "Wing Buffet",
      "Tempest Fang",
      "Aero Crush",
      "Drake Breath",
      "Roar of Ages",
      "Storm Tail",
      "Zephyr Slash"
    ],
    weaknesses: ["Ice", "Fairy"],
    specialAbilities: [
      "Sky Sovereign — +12% ATK while airborne",
      "Storm’s Wrath — all air-type moves +18% power"
    ],
    raidReward: { gold: 6000, xp: 2500, title: "Skybreaker" }
  },
  {
    id: "cb4",
    name: "Wezaemon the Tombguard",
    image: "https://static.wikia.nocookie.net/shangrila-frontier/images/1/19/Wezaemon_Artwork.png",
    type: "Steel/Ground",
    level: 210,
    maxHp: 65000,
    hp: 65000,
    moves: [
      "Guard Slam",
      "Iron Charge",
      "Tomb Strike",
      "Steel Roar",
      "Shield Bash",
      "Grave Rush",
      "Ancient Guard",
      "Armor Crush",
      "Tombbreaker"
    ],
    weaknesses: ["Fire", "Lightning"],
    specialAbilities: [
      "Tomb Shield — reduces magic damage by 20%",
      "Heavy Guard — chance to counterattack when hit"
    ],
    raidReward: { gold: 6200, xp: 2700, title: "Tombcrusher" }
  },
  {
    id: "cb5",
    name: "Orchestra of Doom Echo",
    image: "https://static.wikia.nocookie.net/shangrila-frontier/images/8/8e/Orchestra_of_Doom_Echo_Artwork.png",
    type: "Dark/Sound",
    level: 230,
    maxHp: 62000,
    hp: 62000,
    moves: [
      "Doom Crescendo",
      "Echo Burst",
      "Sonic Slash",
      "Resonance Roar",
      "Reverberate",
      "Harmonic Crush",
      "Cacophony Wave",
      "Silence Breaker",
      "Final Note"
    ],
    weaknesses: ["Light", "Wind"],
    specialAbilities: [
      "Echo Barrier — absorbs non-elemental damage once per turn",
      "Sound Overload — spawns echo duplicates on low HP"
    ],
    raidReward: { gold: 6500, xp: 2800, title: "Echo Bane" }
  },
  {
    id: "cb6",
    name: "Cernunnos the Wild Stalker",
    image: "https://cdn.pixabay.com/photo/2018/12/14/07/25/deer-3873441_1280.png",
    type: "Nature/Beast",
    level: 225,
    maxHp: 60000,
    hp: 60000,
    moves: [
      "Nature’s Wrath",
      "Wild Charge",
      "Root Break",
      "Forest Fury",
      "Beast Roar",
      "Thorn Barrage",
      "Earthshake",
      "Blessed Howl",
      "Rampage"
    ],
    weaknesses: ["Fire", "Ice"],
    specialAbilities: [
      "Primal Guardian — HP regen each turn when not attacked",
      "Terrashield — +15% DEF from earth terrain"
    ],
    raidReward: { gold: 6300, xp: 2650, title: "Wildbane" }
  },
  {
    id: "cb7",
    name: "Astra Sovereign",
    image: "https://cdn.pixabay.com/photo/2020/07/21/03/49/galaxy-5422671_1280.png",
    type: "Cosmic/Light",
    level: 240,
    maxHp: 70000,
    hp: 70000,
    moves: [
      "Starfall",
      "Cosmic Nova",
      "Radiant Slash",
      "Astral Beam",
      "Solar Fury",
      "Celestial Roar",
      "Nebula Crash",
      "Lunar Pulse",
      "Galactic Storm"
    ],
    weaknesses: ["Dark", "Void"],
    specialAbilities: [
      "Astral Sheath — reduces damage from non-cosmic attacks by 20%",
      "Solar Ascend — power increases under star alignment"
    ],
    raidReward: { gold: 71000, xp: 3200, title: "Cosmic Vanquisher" }
  }
];

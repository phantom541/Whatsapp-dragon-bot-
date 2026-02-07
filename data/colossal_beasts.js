export const COLOSSAL_BEASTS = [
  {
    id: "cb_01",
    name: "Lycagon the Nightslayer",
    type: "Dark Beast",
    hp: 15000,
    maxHp: 15000,
    attack: 500,
    defense: 350,
    speed: 75,
    affinity: "Dark",
    weaknesses: ["Light"],
    moves: ["Shadow Slash","Night Roar","Dark Pulse","Claw Frenzy","Soul Siphon","Ambush","Fear Howl","Dark Fang","Eclipse Strike"],
    image: "https://pixabay.com/illustrations/creature-monster-goblin-fantasy-6731005/",
    raidReward: { gold: 8000, xp: 5000, title: "Nightslayer Conqueror" }
  },
  {
    id: "cb_02",
    name: "Siegwurm the Sky Ruler",
    type: "Dragon",
    hp: 18000,
    maxHp: 18000,
    attack: 550,
    defense: 400,
    speed: 80,
    affinity: "Fire",
    weaknesses: ["Water"],
    moves: ["Inferno Roar","Sky Dive","Flame Breath","Wing Gust","Tail Slam","Claw Strike","Dragon Roar","Heat Wave","Meteor Strike"],
    image: "https://pixabay.com/illustrations/dragon-fantasy-fly-fantasy-creature-5984773/",
    raidReward: { gold: 9000, xp: 6000, title: "Sky Ruler Slayer" }
  }
];

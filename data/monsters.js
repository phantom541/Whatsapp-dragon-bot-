export const DUNGEON_MONSTERS = [
  {
    id: 1,
    name: "Cave Gnawer",
    type: "Beast",
    image: "https://i.imgur.com/6nXQkQf.png",
    baseLevel: 3,
    stats: { hp: 120, atk: 18, def: 10, spd: 12 },
    moves: ["Bite", "Claw Swipe", "Growl", "Rush"]
  },
  {
    id: 2,
    name: "Ash Slime",
    type: "Fire",
    image: "https://i.imgur.com/M9aZJYy.png",
    baseLevel: 4,
    stats: { hp: 140, atk: 16, def: 12, spd: 8 },
    moves: ["Burn Touch", "Melt", "Heat Pulse", "Split"]
  },
  {
    id: 3,
    name: "Stoneback Beetle",
    type: "Earth",
    image: "https://i.imgur.com/lGx6PpU.png",
    baseLevel: 5,
    stats: { hp: 180, atk: 14, def: 22, spd: 6 },
    moves: ["Shell Bash", "Roll", "Stone Clamp", "Guard"]
  },
  {
    id: 4,
    name: "Duskhound",
    type: "Dark",
    image: "https://i.imgur.com/yZQq0F8.png",
    baseLevel: 6,
    stats: { hp: 160, atk: 22, def: 12, spd: 18 },
    moves: ["Shadow Bite", "Pounce", "Howl", "Fade"]
  },
  {
    id: 5,
    name: "Feral Dryad",
    type: "Nature",
    image: "https://i.imgur.com/9F0xFzX.png",
    baseLevel: 6,
    stats: { hp: 150, atk: 20, def: 14, spd: 14 },
    moves: ["Vine Lash", "Thorn Shot", "Root Bind", "Regrow"]
  },
  {
    id: 6,
    name: "Ruin Skeleton",
    type: "Undead",
    image: "https://i.imgur.com/7uE2sQk.png",
    baseLevel: 7,
    stats: { hp: 170, atk: 24, def: 15, spd: 10 },
    moves: ["Bone Slash", "Rattle", "Pierce", "Reassemble"]
  },
  {
    id: 7,
    name: "Venom Moth",
    type: "Poison",
    image: "https://i.imgur.com/2P0A6Yr.png",
    baseLevel: 7,
    stats: { hp: 130, atk: 26, def: 10, spd: 20 },
    moves: ["Toxic Dust", "Wing Cut", "Drain", "Evasion"]
  },
  {
    id: 8,
    name: "Iron Pup",
    type: "Steel",
    image: "https://i.imgur.com/3eC5wzG.png",
    baseLevel: 8,
    stats: { hp: 200, atk: 22, def: 24, spd: 8 },
    moves: ["Metal Fang", "Brace", "Charge", "Crunch"]
  },
  {
    id: 9,
    name: "Mist Wraith",
    type: "Ghost",
    image: "https://i.imgur.com/8u9F8yJ.png",
    baseLevel: 9,
    stats: { hp: 140, atk: 28, def: 12, spd: 22 },
    moves: ["Phase Claw", "Haunt", "Fog Veil", "Chill"]
  },
  {
    id: 10,
    name: "Frost Crawler",
    type: "Ice",
    image: "https://i.imgur.com/Z6ZlWm9.png",
    baseLevel: 9,
    stats: { hp: 190, atk: 24, def: 18, spd: 10 },
    moves: ["Ice Fang", "Freeze", "Snow Guard", "Crack"]
  },
  {
    id: 11,
    name: "Blood Bat",
    type: "Dark",
    image: "https://i.imgur.com/6hM8t0U.png",
    baseLevel: 10,
    stats: { hp: 150, atk: 30, def: 12, spd: 26 },
    moves: ["Drain Bite", "Screech", "Dive", "Blur"]
  },
  {
    id: 12,
    name: "Runic Golem",
    type: "Arcane",
    image: "https://i.imgur.com/WF5G9yo.png",
    baseLevel: 11,
    stats: { hp: 260, atk: 26, def: 30, spd: 6 },
    moves: ["Rune Slam", "Mana Burst", "Barrier", "Overload"]
  },
  {
    id: 13,
    name: "Blight Stalker",
    type: "Poison",
    image: "https://i.imgur.com/vE2bX6P.png",
    baseLevel: 11,
    stats: { hp: 170, atk: 32, def: 14, spd: 20 },
    moves: ["Venom Cut", "Ambush", "Corrode", "Fade"]
  },
  {
    id: 14,
    name: "Thunder Lynx",
    type: "Electric",
    image: "https://i.imgur.com/4dLzR2p.png",
    baseLevel: 12,
    stats: { hp: 180, atk: 34, def: 16, spd: 28 },
    moves: ["Volt Claw", "Flash Step", "Discharge", "Snarl"]
  },
  {
    id: 15,
    name: "Obsidian Serpent",
    type: "Fire",
    image: "https://i.imgur.com/YJkF8T9.png",
    baseLevel: 12,
    stats: { hp: 210, atk: 36, def: 18, spd: 18 },
    moves: ["Magma Bite", "Coil", "Eruption", "Burn"]
  },
  {
    id: 16,
    name: "Grave Knight",
    type: "Undead",
    image: "https://i.imgur.com/1DkZ8Ff.png",
    baseLevel: 13,
    stats: { hp: 240, atk: 38, def: 28, spd: 10 },
    moves: ["Cursed Slash", "Shield Break", "Oath", "Retribution"]
  },
  {
    id: 17,
    name: "Abyss Leech",
    type: "Water",
    image: "https://i.imgur.com/2qJ7m3A.png",
    baseLevel: 13,
    stats: { hp: 200, atk: 34, def: 18, spd: 14 },
    moves: ["Siphon", "Latch", "Abyss Pull", "Regenerate"]
  },
  {
    id: 18,
    name: "Sunken Horror",
    type: "Dark",
    image: "https://i.imgur.com/vpR9H8u.png",
    baseLevel: 14,
    stats: { hp: 260, atk: 40, def: 20, spd: 12 },
    moves: ["Crush", "Terror Gaze", "Wave Slam", "Drown"]
  },
  {
    id: 19,
    name: "Void Imp",
    type: "Arcane",
    image: "https://i.imgur.com/rx4n9pL.png",
    baseLevel: 14,
    stats: { hp: 160, atk: 42, def: 14, spd: 30 },
    moves: ["Warp Slash", "Blink", "Hex", "Collapse"]
  },
  {
    id: 20,
    name: "Ancient Watcher",
    type: "Light",
    image: "https://i.imgur.com/2X1x9XQ.png",
    baseLevel: 15,
    stats: { hp: 280, atk: 44, def: 30, spd: 14 },
    moves: ["Judgment Ray", "Sanctify", "Seal", "Purge"]
  },
  {
    id: 21,
    name: "Crimson Jaw",
    type: "Beast",
    image: "https://i.imgur.com/Vm8t9kG.png",
    baseLevel: 15,
    stats: { hp: 240, atk: 46, def: 22, spd: 18 },
    moves: ["Rend", "Savage Bite", "Bleed", "Intimidate"]
  },
  {
    id: 22,
    name: "Arc Spire Sentinel",
    type: "Electric",
    image: "https://i.imgur.com/6fMZ9cZ.png",
    baseLevel: 15,
    stats: { hp: 260, atk: 42, def: 34, spd: 12 },
    moves: ["Arc Beam", "Overcharge", "Lockdown", "Pulse"]
  },
  {
    id: 23,
    name: "Rotting Abomination",
    type: "Undead",
    image: "https://i.imgur.com/3qA8HjT.png",
    baseLevel: 16,
    stats: { hp: 300, atk: 44, def: 26, spd: 8 },
    moves: ["Putrefy", "Slam", "Infect", "Endure"]
  },
  {
    id: 24,
    name: "Mirror Shade",
    type: "Ghost",
    image: "https://i.imgur.com/1s8zq6r.png",
    baseLevel: 16,
    stats: { hp: 200, atk: 48, def: 20, spd: 30 },
    moves: ["Reflect Cut", "Phase Shift", "Copy", "Blur"]
  },
  {
    id: 25,
    name: "Ember Revenant",
    type: "Fire",
    image: "https://i.imgur.com/kZP2qvM.png",
    baseLevel: 17,
    stats: { hp: 260, atk: 50, def: 24, spd: 22 },
    moves: ["Flare Slash", "Burning Aura", "Ignite", "Rekindle"]
  },
  {
    id: 26,
    name: "Deepcoil Leviathanling",
    type: "Water",
    image: "https://i.imgur.com/yYF9Z4H.png",
    baseLevel: 17,
    stats: { hp: 320, atk: 48, def: 30, spd: 14 },
    moves: ["Tidal Crush", "Coil", "Pressure Wave", "Soak"]
  },
  {
    id: 27,
    name: "Void-Touched Cultist",
    type: "Dark",
    image: "https://i.imgur.com/0uHcGvL.png",
    baseLevel: 18,
    stats: { hp: 220, atk: 52, def: 22, spd: 26 },
    moves: ["Void Bolt", "Sacrifice", "Hex Brand", "Rift Step"]
  },
  {
    id: 28,
    name: "Crystal Spine Drifter",
    type: "Earth",
    image: "https://i.imgur.com/JMZqfCk.png",
    baseLevel: 18,
    stats: { hp: 340, atk: 46, def: 38, spd: 10 },
    moves: ["Crystal Lance", "Fortify", "Shard Burst", "Anchor"]
  },
  {
    id: 29,
    name: "Stormbound Valk",
    type: "Air",
    image: "https://i.imgur.com/8qZL1pM.png",
    baseLevel: 19,
    stats: { hp: 260, atk: 54, def: 24, spd: 34 },
    moves: ["Sky Rend", "Gale Dive", "Aerial Guard", "Momentum"]
  },
  {
    id: 30,
    name: "Eclipse Devourer",
    type: "Dark",
    image: "https://i.imgur.com/4d7hR6E.png",
    baseLevel: 20,
    stats: { hp: 360, atk: 60, def: 32, spd: 18 },
    moves: ["Consume Light", "Gravity Crush", "Null Field", "Obliterate"]
  }
];

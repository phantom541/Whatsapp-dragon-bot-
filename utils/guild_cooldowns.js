export const GUILD_DUNGEON_COOLDOWNS = {
  easy: 5 * 60 * 1000,        // 5 min
  nice: 10 * 60 * 1000,       // 10 min
  normal: 20 * 60 * 1000,      // 20 min
  hard: 40 * 60 * 1000,       // 40 min
  extreme: 60 * 60 * 1000,     // 1 hour
  crazy: 2 * 60 * 60 * 1000,   // 2 hours
  nightmare: 4 * 60 * 60 * 1000 // 4 hours
};

export function canEnterDungeon(guild, difficulty) {
  if (!guild.cooldowns) guild.cooldowns = {};

  const lastRun = guild.cooldowns[difficulty.toLowerCase()];
  if (!lastRun) return true;

  const now = Date.now();
  return now - lastRun >= (GUILD_DUNGEON_COOLDOWNS[difficulty.toLowerCase()] || 0);
}

export function setDungeonCooldown(guild, difficulty) {
  if (!guild.cooldowns) guild.cooldowns = {};
  guild.cooldowns[difficulty.toLowerCase()] = Date.now();
}

export function getRemainingCooldown(guild, difficulty) {
  if (!guild.cooldowns) return 0;
  const lastRun = guild.cooldowns[difficulty.toLowerCase()];
  if (!lastRun) return 0;

  const now = Date.now();
  const diff = now - lastRun;
  const cooldown = GUILD_DUNGEON_COOLDOWNS[difficulty.toLowerCase()] || 0;

  return Math.max(0, cooldown - diff);
}

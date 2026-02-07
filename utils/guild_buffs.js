export const GUILD_BUFF_LIMITS = {
  1: { hp: 2, xpBoost: 0.02, goldBoost: 0.02, dragonAttack: 0.02, dragonDefense: 0.02 },
  3: { attack: 3, xpBoost: 0.05, goldBoost: 0.05, dragonAttack: 0.05, dragonDefense: 0.05 },
  5: { xpBoost: 0.10, goldBoost: 0.10, dragonAttack: 0.08, dragonDefense: 0.08 },
  7: { goldBoost: 0.15, attack: 5, dragonAttack: 0.12, dragonDefense: 0.12 },
  10: { critChance: 2, xpBoost: 0.20, goldBoost: 0.20, dragonAttack: 0.15, dragonDefense: 0.15 }
};

export function getGuildBuffs(guildLevel) {
  const buffs = { hp: 0, attack: 0, xpBoost: 0, goldBoost: 0, critChance: 0, dragonAttack: 0, dragonDefense: 0 };

  for (const lvl in GUILD_BUFF_LIMITS) {
    if (guildLevel >= parseInt(lvl)) {
      const levelBuffs = GUILD_BUFF_LIMITS[lvl];
      if (levelBuffs.hp) buffs.hp += levelBuffs.hp;
      if (levelBuffs.attack) buffs.attack += levelBuffs.attack;
      if (levelBuffs.xpBoost) buffs.xpBoost = Math.max(buffs.xpBoost, levelBuffs.xpBoost);
      if (levelBuffs.goldBoost) buffs.goldBoost = Math.max(buffs.goldBoost, levelBuffs.goldBoost);
      if (levelBuffs.critChance) buffs.critChance += levelBuffs.critChance;
      if (levelBuffs.dragonAttack) buffs.dragonAttack = Math.max(buffs.dragonAttack, levelBuffs.dragonAttack);
      if (levelBuffs.dragonDefense) buffs.dragonDefense = Math.max(buffs.dragonDefense, levelBuffs.dragonDefense);
    }
  }

  return buffs;
}

export function applyGuildRewardsBuff(guild, baseRewards) {
  if (!guild || !guild.level) return baseRewards;

  const buffs = getGuildBuffs(guild.level);

  return {
    ...baseRewards,
    gold: Math.floor(baseRewards.gold * (1 + buffs.goldBoost)),
    xp: Math.floor(baseRewards.xp * (1 + buffs.xpBoost))
  };
}

export function applyGuildStatBuffs(guild, dragonStats) {
  if (!guild || !guild.level) return dragonStats;

  const buffs = getGuildBuffs(guild.level);

  return {
    ...dragonStats,
    hp: (dragonStats.hp || 0) + buffs.hp,
    maxHp: (dragonStats.maxHp || 0) + buffs.hp,
    atk: Math.floor((dragonStats.atk || 0) * (1 + buffs.dragonAttack)),
    def: Math.floor((dragonStats.def || 0) * (1 + buffs.dragonDefense)),
  };
}

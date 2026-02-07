const TYPE_BONUS = {
  FIRE: { attack: 2, speed: 1 },
  WATER: { hp: 3, defense: 1 },
  EARTH: { defense: 3, hp: 2 },
  AIR: { speed: 3, attack: 1 },
  LIGHT: { attack: 2, hp: 2 },
  DARK: { attack: 2, crit: 1 }
};

export function scaleStats(dragon) {
  const lvl = dragon.level || 1;
  const base = dragon.baseStats || { hp: 50, attack: 10, defense: 5, speed: 5, crit: 0 };

  // Normalize type
  const type = (dragon.type || dragon.element || 'FIRE').toUpperCase();
  const bonus = TYPE_BONUS[type] || {};

  dragon.stats = {
    maxHp: base.hp + lvl * (3 + (bonus.hp || 0)),
    attack: base.attack + lvl * (2 + (bonus.attack || 0)),
    defense: base.defense + lvl * (2 + (bonus.defense || 0)),
    speed: (base.speed || 5) + lvl * (1 + (bonus.speed || 0)),
    crit: (base.crit || 0) + lvl * (bonus.crit || 0)
  };

  // Restore HP on level-up
  dragon.stats.hp = dragon.stats.maxHp;

  // Ensure current hp field for battle logic
  dragon.hp = dragon.stats.hp;
  dragon.maxHp = dragon.stats.maxHp;
  dragon.atk = dragon.stats.attack;
  dragon.def = dragon.stats.defense;
}

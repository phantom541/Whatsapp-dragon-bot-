export const LONE_WOLF_TITLES = [
  { kills: 1, title: "🐺 Lone Wolf" },
  { kills: 5, title: "Solitary Predator" },
  { kills: 10, title: "One-Man Cataclysm" }
];

export function updateLoneWolfTitle(player, hasGuild, isPrivileged) {
  if (!player.roles) player.roles = [];

  const hasLoneWolf = player.roles.includes("🐺 Lone Wolf");

  if (isPrivileged && !hasGuild && !hasLoneWolf) {
    player.roles.push("🐺 Lone Wolf");
  }

  if ((hasGuild || !isPrivileged) && hasLoneWolf) {
    player.roles = player.roles.filter(t => t !== "🐺 Lone Wolf");
  }
}

export function checkLoneWolfAchievements(player) {
  if (!player.roles || player.guild) return; // Note: player.guild field might be handled by getPlayerGuild later

  const soloClears = player.stats?.solo_dungeons || 0;

  for (const t of LONE_WOLF_TITLES) {
    if (soloClears >= t.kills && !player.roles.includes(t.title)) {
      player.roles.push(t.title);
    }
  }
}

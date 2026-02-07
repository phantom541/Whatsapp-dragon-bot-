export function updateLoneWolfTitle(player, hasGuild, isPrivileged) {
  if (!player.roles) player.roles = [];

  const hasTitle = player.roles.includes("🐺 Lone Wolf");

  if (isPrivileged && !hasGuild && !hasTitle) {
    player.roles.push("🐺 Lone Wolf");
  }

  if ((hasGuild || !isPrivileged) && hasTitle) {
    player.roles = player.roles.filter(t => t !== "🐺 Lone Wolf");
  }
}

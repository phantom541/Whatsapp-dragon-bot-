export function hasCharm(player, charmId) {
    return (player.inventory?.[charmId] || 0) > 0
}

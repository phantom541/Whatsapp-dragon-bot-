import { getActiveBeast } from './colossal_manager.js';

/**
 * Notify a WhatsApp group that a Colossal Beast spawned
 */
export async function notifyColossalSpawn(sock, groupId) {
  const beast = await getActiveBeast();
  if (!beast) return;

  const caption = `🦖 *A COLOSSAL BEAST HAS APPEARED!* 🦖\n\n` +
    `👾 *Name:* ${beast.name}\n` +
    `📈 *Level:* ${beast.level}\n\n` +
    `💡 Be the first to fight it! Use *=battlecolossal* to start the 1v1 encounter.`;

  if (beast.image) {
      await sock.sendMessage(groupId, { image: { url: beast.image }, caption });
  } else {
      await sock.sendMessage(groupId, { text: caption });
  }
}

/**
 * Notify when a player defeats a beast
 */
export async function notifyColossalDefeat(sock, groupId, player, beast) {
  const message = `🏆 *${player.name}* has defeated the Colossal Beast *${beast.name}*!\n🎖️ Exclusive title awarded and beast added to collection!`;
  await sock.sendMessage(groupId, { text: message });
}

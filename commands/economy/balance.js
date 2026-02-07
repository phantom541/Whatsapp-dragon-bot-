export default {
  name: 'balance',
  description: 'View your balance',

  execute: async ({ sender, reply, getPlayer }) => {
    const player = getPlayer(sender);

    if (!player) return;

    reply(
`💼 *Your Balance*

👛 Wallet: ${player.gold}
🏦 Bank: ${player.bank}
🏅 Rank: ${player.rank}`
    );
  }
};

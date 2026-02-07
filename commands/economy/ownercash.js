import DB from "../../utils/database.js";
import { addGold } from "../../utils/economy.js";

export default {
    name: "ownercash",
    description: "Claim bonus cash for owners. (Secondary Owners Only)",
    async execute({ reply, sender, args }) {
        const db = await DB.getDB('users');
        const user = db.users[sender];

        if (!user?.isOwner || user.isPrimaryOwner) {
            return reply("❌ This command is only for secondary owners.");
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            return reply("❌ Please specify a valid amount of gold to claim.");
        }

        if (amount > 25000000) {
            return reply("❌ Maximum per use is 25,000,000 gold.");
        }

        if ((user.ownerBonusUses || 0) >= 4) {
            return reply("❌ You have already used all 4 of your bonus claims.");
        }

        user.ownerBonusUses = (user.ownerBonusUses || 0) + 1;
        await addGold(sender, amount); // addGold handles saveDB

        reply(`💰 Successfully claimed ${amount.toLocaleString()} gold.\nUses left: ${4 - user.ownerBonusUses}`);
    }
};

import DB from "../../utils/database.js";

const PRIMARY_OWNER = '26775949123@s.whatsapp.net';

export default {
    name: "promoteowner",
    description: "Promote a user to owner status. (Primary Owner Only)",
    async execute({ sock, msg, reply, sender, args }) {
        if (sender !== PRIMARY_OWNER) {
            return reply("❌ You are not authorized to use this command.");
        }

        // Get mentioned JID or quoted message sender
        let target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                     msg.message.extendedTextMessage?.contextInfo?.participant;

        if (!target && args[0]) {
            target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }

        if (!target) {
            return reply("❌ Please mention a user or reply to their message to promote them.");
        }

        const userDb = await DB.getDB('users');
        userDb.users ??= {};
        userDb.users[target] ??= { id: target };

        userDb.users[target].isOwner = true;
        userDb.users[target].isPrimaryOwner = false;
        userDb.users[target].ownerBonusUses = 0;
        userDb.users[target].roles = (userDb.users[target].roles || []);
        if (!userDb.users[target].roles.includes('owner')) {
            userDb.users[target].roles.push('owner');
        }
        userDb.users[target].admin = true;

        await DB.saveDB('users');
        reply(`✅ User @${target.split('@')[0]} has been promoted to Owner.`, { mentions: [target] });
    }
};

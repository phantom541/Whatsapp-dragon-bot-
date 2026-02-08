import fs from "fs";
import path from "path";
const deathPath = path.resolve("./database/death.json");
const death = JSON.parse(fs.readFileSync(deathPath, "utf-8"));
import { startBattle } from "../../system/battleEngine.js";
import { sendMessage } from "../../system/sendMessage.js";
import { resetPlayer } from "../../utils/resetPlayer.js";
import { promoteToOwner } from "../../utils/promote.js";
import { grantColossal } from "../../utils/colossal.js";
import { addGold } from "../../utils/economy.js";
import { rankUp } from "../../utils/rank.js";
import DB from "../../utils/database.js";

const PRIMARY_OWNER = "26775949123@s.whatsapp.net";

export default {
  name: "unleashdeath",
  aliases: ["unleash-death", "summon-death"],
  description: "Summon Death itself",
  execute: async ({ sock, msg, args }) => {
    const sender = msg.key.participant || msg.key.remoteJid;

    if (sender !== PRIMARY_OWNER) {
      return sendMessage(sock, msg.key.remoteJid, {
        text: "You are not the one Death answers to."
      });
    }

    let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                 msg.message?.extendedTextMessage?.contextInfo?.participant;

    if (!target && args[0]) {
        target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    }

    if (!target) {
        return sendMessage(sock, msg.key.remoteJid, { text: "❌ Please mention a target." });
    }

    await sendMessage(sock, msg.key.remoteJid, {
      image: { url: death.image },
      caption: "🐺 *Death has been unleashed.*\nThere will be no escape."
    });

    const result = await startBattle({
      attacker: death,
      defenderJid: target,
      forced: true,
      allowItems: false,
      allowEscape: false
    });

    if (result.winner === target) {
      await promoteToOwner(target);
      await grantColossal(target, 1);
      await addGold(target, 100000000);
      await rankUp(target, 5);

      // Add achievement
      const db = await DB.getDB('users');
      if (db.users[target]) {
          db.users[target].achievements = db.users[target].achievements || [];
          if (!db.users[target].achievements.includes("Defied Death")) {
              db.users[target].achievements.push("Defied Death");
          }
          await DB.saveDB('users');
      }

      await sendMessage(sock, msg.key.remoteJid, {
        text: "⚠️ Impossible.\nThe user has defied Death itself."
      });
    } else {
      await resetPlayer(target);

      await sendMessage(sock, msg.key.remoteJid, {
        text: "☠️ Death has claimed another soul."
      });
    }
  }
};

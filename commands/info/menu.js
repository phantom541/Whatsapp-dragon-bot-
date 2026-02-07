export default {
  name: 'menu',
  description: 'Show the primary bot menu with all commands',
  async execute({ msg, reply }) {
    const menu = `
📜 *PHANTOM Bot Menu*

👤 *Owner:* PHANTOM

---

🛠 *Core Commands*
• %profile – View your stats, dragons, and progress
• %inventory / %bag – Check your items and traps
• %guild – Create, join, or manage guilds
• %dungeon – Enter a dungeon or check raid info

---

🐉 *Dragon System*
• %dragon – View your dragons
• %train – Train a dragon for XP
• %battle dragon – Fight other players’ dragons or wild dragons
• %dragon summary – Quick stats for all dragons

---

🦖 *Colossal Beasts*
• %battle colossal – Fight active Colossal Beasts
• %colossal --[name] – View info & image of a Colossal Beast
• %colossalleaderboard – See top beast hunters

---

💰 *Economy / Mart*
• %mart --page=1-6 – Buy traps, potions, charms, and rare items
• %sell <item> – Sell items back for gold
• %gold – Check your current balance

---

🎮 *Fun & Media*
• %play <song> – Play/download audio from YouTube
• %ytv <link> – Download YouTube video
• %yta <link> – Download YouTube audio
• %yts <search> – Search YouTube for videos
• %tiktok <link> – Download TikTok video
• %ig <link> – Download Instagram video

---

🛡 *Admin / Mod Commands*
• %mod add <player> – Assign mod role
• %mod remove <player> – Remove mod role
• %owner add <player> – Assign owner role (primary owner only)
• %ban <player> – Ban player from group
• %mute <player> – Mute a player temporarily

---

🎴 *Cards & Collectibles*
• %cards – View your collection
• %draw – Pull a random card
• %trade <player> – Trade cards with another player

---

🏆 *Achievements & Titles*
• %titles – Check all earned titles
• %achievements – View your progress for dragons, beasts, dungeons

💡 Tip: Use '--help' after any command for detailed instructions, e.g., %dragon --help
`;

    return reply(menu);
  }
};

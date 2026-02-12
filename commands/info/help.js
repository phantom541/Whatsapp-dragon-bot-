const MENU_DETAILS = {
  core: `
🛠 *Core Commands*:
• =profile – View your stats, dragons, and progress
• =inventory / =bag – Check your items and traps
• =guild – Create, join, or manage guilds
• =dungeon – Enter a dungeon or check raid info
Tip: Use '--help' after each command for step-by-step usage
`,
  dragon: `
🐉 *Dragon System*:
• =dragon – View your dragons
• =train – Train a dragon for XP
• =battle dragon – Fight other players’ dragons or wild dragons
• =dragon summary – Quick stats for all dragons
Tip: Training increases XP and unlocks new moves!
`,
  colossal: `
🦖 *Colossal Beasts*:
• =battle colossal – Fight active Colossal Beasts
• =colossal --[name] – View info & image of a Colossal Beast
• =colossalleaderboard – See top beast hunters
Tip: Only one Colossal Beast can be active at a time. Use traps to guarantee capture.
`,
  economy: `
💰 *Economy / Mart*:
• =mart --page=1-6 – Buy traps, potions, charms, and rare items
• =sell <item> – Sell items back for gold
• =gold – Check your current balance
Tip: Higher rarity items cost more but give better benefits.
`,
  fun: `
🎮 *Fun & Media*:
• =play <song> – Play/download audio from YouTube
• =ytv <link> – Download YouTube video
• =yta <link> – Download YouTube audio
• =yts <search> – Search YouTube for videos
• =tiktok <link> – Download TikTok video
• =ig <link> – Download Instagram video
`,
  admin: `
🛡 *Admin / Mod Commands*:
• =mod add <player> – Assign mod role
• =mod remove <player> – Remove mod role
• =owner add <player> – Assign owner role (primary owner only)
• =ban <player> – Ban player from group
• =mute <player> – Mute a player temporarily
`,
  cards: `
🎴 *Cards & Collectibles*:
• =cards – View your collection
• =draw – Pull a random card
• =trade <player> – Trade cards with another player
`,
  achievements: `
🏆 *Achievements & Titles*:
• =titles – Check all earned titles
• =achievements – View your progress for dragons, beasts, dungeons
`
};

export default {
  name: 'help',
  description: 'Show the full menu or detailed info about a specific section',
  async execute({ msg, reply, args }) {
    // If we have args from the handler, use the first one
    const section = args && args[0] ? args[0].toLowerCase() : null;

    if (!section) {
      // No argument → show full menu
      const fullMenu = Object.values(MENU_DETAILS).join('\n---\n');
      return reply(`📜 *PHANTOM Bot Help Menu*\n\n${fullMenu}`);
    }

    if (MENU_DETAILS[section]) {
      return reply(MENU_DETAILS[section]);
    }

    return reply('❌ Section not found. Available sections: core, dragon, colossal, economy, fun, admin, cards, achievements');
  }
};

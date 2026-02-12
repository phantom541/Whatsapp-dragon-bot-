import { youtubeSearch } from '../../utils/media_downloader.js';

export default {
    name: 'play',
    description: 'Search a song on YouTube',
    execute: async ({ msg, reply, args }) => {
        const query = args.join(' ');
        if (!query) return reply("❌ Send a song name or lyrics.");

        try {
            const results = await youtubeSearch(query);
            const top5 = results.slice(0, 5);

            if (top5.length === 0) return reply("❌ No results found.");

            let text = '🎶 *Top 5 YouTube Results:*\n\n';
            top5.forEach((v, i) => {
                text += `${i + 1}. *${v.title}*\n🔗 ${v.url}\n⏱️ Duration: ${v.duration}\n\n`;
            });
            text += "Use *=yta <link>* for audio or *=ytv <link>* for video!";

            reply(text);
        } catch (err) {
            reply(`❌ Search failed: ${err.message}`);
        }
    }
};

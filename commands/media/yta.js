import { downloadYouTubeAudio, youtubeSearch } from '../../utils/media_downloader.js';
import { sendLocalFile } from '../../utils/media_manager.js';
import { isCached, saveToCache, autoCleanup, generateFilePath } from '../../utils/file_manager.js';
import fs from 'fs';

export default {
    name: 'yta',
    description: 'Download YouTube audio from link',
    execute: async ({ sock, msg, reply, args, from }) => {
        try {
            let url = args[0];
            if (!url) return reply("❌ Provide a YouTube link or search query.");

            if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
                reply('🔍 Searching YouTube for: ' + args.join(' '));
                const results = await youtubeSearch(args.join(' '));
                if (results.length === 0) return reply("❌ No results found.");
                url = results[0].url;
            }

            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
            const cacheKey = `yta_${videoId}`;
            let cachedPath = isCached(cacheKey);

            if (cachedPath) {
                await sendLocalFile(sock, from, { filePath: cachedPath, caption: '🎧 *Cached audio ready!*', quoted: msg });
                return;
            }

            const filePath = generateFilePath(cacheKey, 'mp3');
            reply('⬇️ *Starting download...*');

            await downloadYouTubeAudio(url, filePath, async (downloaded, total) => {
                // No progress updates for audio usually needed as it's fast, but we can if wanted.
            });

            const stats = fs.statSync(filePath);
            if (stats.size > 200 * 1024 * 1024) {
                fs.unlinkSync(filePath);
                return reply('❌ File too large (max 200MB).');
            }

            saveToCache(cacheKey, fs.readFileSync(filePath));
            await sendLocalFile(sock, from, { filePath, caption: '🎧 *Download complete!*', quoted: msg });
            autoCleanup(filePath, 10 * 60 * 1000);

        } catch (err) {
            console.error(err);
            reply(`❌ Failed to download audio: ${err.message}`);
        }
    }
};

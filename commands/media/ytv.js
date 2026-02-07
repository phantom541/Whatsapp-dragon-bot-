import { downloadYouTubeVideo, youtubeSearch } from '../../utils/media_downloader.js';
import { sendLocalFile } from '../../utils/media_manager.js';
import { isCached, saveToCache, autoCleanup, generateFilePath } from '../../utils/file_manager.js';
import fs from 'fs';

export default {
    name: 'ytv',
    description: 'Download a YouTube video and send it',
    execute: async ({ sock, msg, reply, args, from }) => {
        try {
            let url = args[0];
            if (!url) return reply("❌ Provide a YouTube link or search query.");

            // Basic link check
            if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
                // Search instead
                reply('🔍 Searching YouTube for: ' + args.join(' '));
                const results = await youtubeSearch(args.join(' '));
                if (results.length === 0) return reply("❌ No results found.");
                url = results[0].url;
            }

            // Extract video ID for caching
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
            const cacheKey = `ytv_${videoId}`;
            let cachedPath = isCached(cacheKey);

            if (cachedPath) {
                await sendLocalFile(sock, from, { filePath: cachedPath, caption: '🎬 *Cached video ready!*', quoted: msg });
                return;
            }

            const filePath = generateFilePath(cacheKey, 'mp4');
            reply('⬇️ *Starting download...*');

            let lastPercent = 0;
            await downloadYouTubeVideo(url, filePath, async (downloaded, total) => {
                const percent = Math.floor((downloaded / total) * 100);
                // Send progress every 25% to avoid spamming WhatsApp
                if (percent >= lastPercent + 25) {
                    lastPercent = percent;
                    await sock.sendMessage(from, { text: `⬇️ *Downloading:* ${percent}%` }, { quoted: msg });
                }
            });

            // Check file size (redundant as checkSize is in downloader but safe)
            const stats = fs.statSync(filePath);
            if (stats.size > 200 * 1024 * 1024) {
                fs.unlinkSync(filePath);
                return reply('❌ File too large (max 200MB).');
            }

            // Save to cache
            saveToCache(cacheKey, fs.readFileSync(filePath));

            // Send to user
            await sendLocalFile(sock, from, { filePath, caption: '🎬 *Download complete!*', quoted: msg });

            // Schedule cleanup
            autoCleanup(filePath, 10 * 60 * 1000);
        } catch (err) {
            console.error(err);
            reply(`❌ Failed to download video: ${err.message}`);
        }
    }
};

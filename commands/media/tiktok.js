import { downloadSocialVideo } from '../../utils/media_downloader.js';
import { sendLocalFile } from '../../utils/media_manager.js';
import { generateFilePath, autoCleanup } from '../../utils/file_manager.js';

export default {
    name: 'tiktok',
    description: 'Download TikTok video from link',
    execute: async ({ sock, from, msg, reply, args }) => {
        const url = args[0];
        if (!url) return reply("❌ Send a TikTok link.");

        try {
            const filePath = generateFilePath('tiktok_video');
            reply('⬇️ *Fetching TikTok video...*');

            await downloadSocialVideo(url, filePath);
            await sendLocalFile(sock, from, { filePath, caption: '📹 *TikTok video ready!*', quoted: msg });

            autoCleanup(filePath);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    }
};

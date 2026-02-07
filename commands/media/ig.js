import { downloadSocialVideo } from '../../utils/media_downloader.js';
import { sendLocalFile } from '../../utils/media_manager.js';
import { generateFilePath, autoCleanup } from '../../utils/file_manager.js';

export default {
    name: 'ig',
    aliases: ['instagram'],
    description: 'Download Instagram video from link',
    execute: async ({ sock, from, msg, reply, args }) => {
        const url = args[0];
        if (!url) return reply("❌ Send an Instagram link.");

        try {
            const filePath = generateFilePath('ig_video');
            reply('⬇️ *Fetching Instagram video...*');

            await downloadSocialVideo(url, filePath);
            await sendLocalFile(sock, from, { filePath, caption: '📹 *Instagram video ready!*', quoted: msg });

            autoCleanup(filePath);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    }
};

import ytdl from '@distube/ytdl-core';
import ytSearch from 'yt-search';
import fs from 'fs';
import axios from 'axios';

const MAX_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

function checkSize(size) {
    if (size > MAX_SIZE_BYTES) {
        throw new Error("File too large (max 200MB)");
    }
}

export async function youtubeSearch(query) {
    const result = await ytSearch(query);
    return result.videos.map(v => ({
        title: v.title,
        url: v.url,
        description: v.description,
        duration: v.timestamp,
        videoId: v.videoId
    }));
}

export async function downloadYouTubeVideo(url, outputPath, onProgress = null) {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });

    if (format.contentLength) {
        checkSize(Number(format.contentLength));
    }

    const totalBytes = Number(format.contentLength) || 0;
    let downloadedBytes = 0;

    return new Promise((resolve, reject) => {
        const stream = ytdl(url, { quality: 'highestvideo', filter: 'audioandvideo' });

        stream.on('data', chunk => {
            downloadedBytes += chunk.length;
            if (onProgress && totalBytes > 0) {
                onProgress(downloadedBytes, totalBytes);
            }
        });

        stream.pipe(fs.createWriteStream(outputPath))
            .on('finish', () => resolve(outputPath))
            .on('error', reject);
    });
}

export async function downloadYouTubeAudio(url, outputPath, onProgress = null) {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    if (format.contentLength) {
        checkSize(Number(format.contentLength));
    }

    const totalBytes = Number(format.contentLength) || 0;
    let downloadedBytes = 0;

    return new Promise((resolve, reject) => {
        const stream = ytdl(url, { quality: 'highestaudio' });

        stream.on('data', chunk => {
            downloadedBytes += chunk.length;
            if (onProgress && totalBytes > 0) {
                onProgress(downloadedBytes, totalBytes);
            }
        });

        stream.pipe(fs.createWriteStream(outputPath))
            .on('finish', () => resolve(outputPath))
            .on('error', reject);
    });
}

export async function downloadSocialVideo(url, outputPath) {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });

        const totalSize = parseInt(response.headers['content-length'], 10);
        if (!isNaN(totalSize)) checkSize(totalSize);

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(outputPath));
            writer.on('error', reject);
        });
    } catch (err) {
        throw new Error("Failed to download video from link. Ensure it's a direct video link or try a different source.");
    }
}

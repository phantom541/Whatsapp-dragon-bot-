import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve('./cache');
const DOWNLOADS_DIR = path.resolve('./downloads');

// Ensure directories exist
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR);

export function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

export function autoCleanup(filePath, delayMs = 5 * 60 * 1000) {
    setTimeout(() => deleteFile(filePath), delayMs);
}

export function getCachePath(id) {
    return path.join(CACHE_DIR, id.replace(/[^\w-]/g, '_'));
}

export function isCached(id) {
    const filePath = getCachePath(id);
    return fs.existsSync(filePath) ? filePath : null;
}

export function saveToCache(id, buffer) {
    const filePath = getCachePath(id);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

export function generateFilePath(name, ext = 'mp4') {
    const filename = `${Date.now()}_${name.replace(/[^\w-]/g, '_')}.${ext}`;
    return path.join(DOWNLOADS_DIR, filename);
}

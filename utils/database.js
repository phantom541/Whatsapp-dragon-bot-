import fs from 'fs';

export function readJSON(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8') || '{}');
}

export function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

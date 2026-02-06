import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.resolve('./database');

async function readJSON(file) {
  const raw = await fs.readFile(path.join(DB_PATH, file), 'utf-8');
  return JSON.parse(raw);
}

async function writeJSON(file, data) {
  await fs.writeFile(path.join(DB_PATH, file), JSON.stringify(data, null, 2));
}

export default { readJSON, writeJSON };

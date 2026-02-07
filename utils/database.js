import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.resolve('./database');
const dbs = {};

async function readJSON(file) {
  const raw = await fs.readFile(path.join(DB_PATH, file), 'utf-8');
  return JSON.parse(raw);
}

async function writeJSON(file, data) {
  await fs.writeFile(path.join(DB_PATH, file), JSON.stringify(data, null, 2));
}

async function getDB(name = 'users') {
  if (!dbs[name]) {
    dbs[name] = await readJSON(`${name}.json`);
  }
  return dbs[name];
}

async function saveDB(name = 'users') {
  if (dbs[name]) {
    await writeJSON(`${name}.json`, dbs[name]);
  }
}

export default { readJSON, writeJSON, getDB, saveDB };

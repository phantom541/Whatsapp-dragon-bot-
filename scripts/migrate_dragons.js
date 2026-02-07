import fs from 'fs';
import path from 'path';
import { scaleStats } from '../utils/dragon_stats.js';

const DRAGON_FILE = './database/dragons.json';

async function migrate() {
    if (!fs.existsSync(DRAGON_FILE)) return;
    const data = JSON.parse(fs.readFileSync(DRAGON_FILE, 'utf-8'));
    const dragons = data.dragons || {};

    for (const id in dragons) {
        const d = dragons[id];
        if (!d.baseStats) {
            d.baseStats = {
                hp: d.baseHp || d.hp || 50,
                attack: d.baseAtk || d.atk || 10,
                defense: d.baseDef || d.def || 5,
                speed: 5,
                crit: 0
            };
            d.xp = d.xp || 0;
            scaleStats(d);
        }
    }

    fs.writeFileSync(DRAGON_FILE, JSON.stringify({ dragons }, null, 2));
    console.log('✅ Migrated 100 dragons to new RPG structure!');
}

migrate().catch(console.error);

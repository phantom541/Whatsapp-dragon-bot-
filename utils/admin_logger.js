import fs from 'fs';
import path from 'path';

const LOG_FILE = path.resolve('./database/admin_logs.json');

export function recordLog(jid, action) {
    if (!fs.existsSync(path.dirname(LOG_FILE))) {
        fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    }

    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
        try {
            logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        } catch (e) {
            logs = [];
        }
    }

    logs.push({
        timestamp: new Date().toISOString(),
        jid,
        action
    });

    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

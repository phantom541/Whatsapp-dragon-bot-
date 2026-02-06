import baileys from '@adiwajshing/baileys';
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = baileys;
import { handleMessage } from './events.js';

import fs from 'fs';
import path from 'path';

const authPath = './auth_info_baileys/session.json';
if (!fs.existsSync('./auth_info_baileys')) {
    fs.mkdirSync('./auth_info_baileys');
}

const { state, saveState } = useSingleFileAuthState(authPath);

async function connect() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            if(lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                connect(); // reconnect
            } else {
                console.log('Logged out, delete session and re-login');
            }
        } else if(connection === 'open') {
            console.log('WhatsApp bot connected');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        if(m.type !== 'notify') return;
        for(const msg of m.messages) {
            if(!msg.message || msg.key.fromMe) continue;
            handleMessage(sock, msg);
        }
    });

    sock.ev.on('creds.update', saveState);
}

connect();

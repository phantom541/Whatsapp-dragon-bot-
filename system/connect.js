import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { handleMessage } from './events.js';
import fs from 'fs';
import { startSpawnLoop } from './spawner.js';
import pino from 'pino';

const authPath = './auth_info_baileys';

let spawnLoopStarted = false;

async function startSocket() {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                startSocket();
            } else {
                console.log('Logged out, delete session and re-login');
            }
        } else if(connection === 'open') {
            console.log('WhatsApp bot connected');
            if (!spawnLoopStarted) {
                startSpawnLoop(sock);
                spawnLoopStarted = true;
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        if(m.type !== 'notify') return;
        for(const msg of m.messages) {
            if(!msg.message || msg.key.fromMe) continue;
            handleMessage(sock, msg);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

export const sock = await startSocket();

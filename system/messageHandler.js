import { commandHandler } from './commandHandler.js'

export function attachMessageHandler(sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const jid = msg.key.remoteJid
        const sender = msg.key.participant || jid

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            ''

        if (!text.startsWith('=')) return

        const args = text.slice(1).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        await commandHandler(sock, {
            jid,
            sender,
            args,
            command,
            raw: msg
        })
    })
}

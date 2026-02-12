import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;

export async function startBot() {
  const client = new Client({
    authStrategy: new LocalAuth()
  });

  client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('🐉 Bot is ready.');
  });

  client.on('message', async message => {
    console.log(`Message from ${message.from}: ${message.body}`);
  });

  await client.initialize();
}

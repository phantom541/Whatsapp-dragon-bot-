import fs from 'fs';
import path from 'path';

export async function loadCommands() {
    const commands = {};
    const commandFolders = fs.readdirSync('./commands');

    for(const folder of commandFolders) {
        const files = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith('.js'));
        for(const file of files) {
            const cmd = await import(path.resolve(`./commands/${folder}/${file}`));
            if(cmd.default && cmd.default.name) {
                commands[cmd.default.name] = cmd.default.execute;
            }
        }
    }

    return commands;
}

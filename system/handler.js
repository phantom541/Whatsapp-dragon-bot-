import { loadCommands } from './loader.js';

const commands = await loadCommands();

export function handleCommand(sock, msg, command, args) {
    if(commands[command]) {
        try {
            commands[command](sock, msg, args);
        } catch(e) {
            console.error(`Error running command ${command}`, e);
        }
    }
}

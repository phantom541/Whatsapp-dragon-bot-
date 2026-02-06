import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const __dirname = process.cwd();

export async function loadCommands() {
  const commands = {};
  const basePath = path.join(__dirname, 'commands');

  const categories = fs.readdirSync(basePath);

  for (const category of categories) {
    const categoryPath = path.join(basePath, category);

    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const fileUrl = pathToFileURL(filePath).href;
      const module = await import(fileUrl);

      if (!module.default || !module.default.name || !module.default.execute) {
        console.warn(`⚠️ Skipped invalid command file: ${filePath}`);
        continue;
      }

      const cmd = module.default;

      commands[cmd.name] = cmd;
    }
  }

  console.log(`✅ Loaded ${Object.keys(commands).length} commands`);
  return commands;
}

import { bootstrapOwner } from "./system/bootstrapOwner.js";
import { startBot } from "./system/connect.js";

console.log('🐉 Starting Owner Bootstrap...');
await bootstrapOwner();

console.log('🐉 Owner Bootstrap complete. Starting Bot...');
await startBot();

console.log('Hierarchy: PHANTOM > Owners > Mods > Group Admins > Players');

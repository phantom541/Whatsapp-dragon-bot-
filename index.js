import { bootstrapOwner } from "./system/bootstrapOwner.js";

console.log('🐉 Starting Owner Bootstrap...');
await bootstrapOwner();

console.log('🐉 Owner Bootstrap complete. Starting Bot...');
await import('./system/connect.js');

console.log('Hierarchy: PHANTOM > Owners > Mods > Group Admins > Players');

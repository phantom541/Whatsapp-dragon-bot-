import { bootstrapOwner } from './system/bootstrapOwner.js'
import { connectBot } from './system/connect.js'

console.log('🐉 Starting Owner Bootstrap...')
await bootstrapOwner()

console.log('🐉 Owner Bootstrap complete. Starting Bot...')
await connectBot()

console.log('Hierarchy: PHANTOM > Owners > Mods > Group Admins > Players')

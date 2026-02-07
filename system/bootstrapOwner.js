import DB from '../utils/database.js';
import { DRAGONS } from "../data/dragons.js";
import { COLOSSAL_BEASTS } from "../data/colossalBeasts.js";

const OWNER_ID = "26775949123@s.whatsapp.net";
const MAX_PARTY_SIZE = 6;

export async function bootstrapOwner() {
  const userDb = await DB.getDB('users');
  userDb.users = userDb.users || {};

  if (!userDb.users[OWNER_ID]) {
    userDb.users[OWNER_ID] = {
        id: OWNER_ID,
        cards: [],
        den: [],
        party: []
    };
  }

  const owner = userDb.users[OWNER_ID];

  // ── Identity ─────────────────────────────
  owner.id = OWNER_ID;
  owner.role = "OWNER";
  owner.roles = ["owner"];
  owner.admin = true;
  owner.rank = "MAX";
  owner.xp = Number.MAX_SAFE_INTEGER;
  owner.level = 999;
  owner.isPrimaryOwner = true;
  owner.isOwner = true;

  // ── Economy (true infinite, not a number hack) ──
  owner.wallet = Number.MAX_SAFE_INTEGER;
  owner.bank = Number.MAX_SAFE_INTEGER;
  owner.infiniteMoney = true;

  // ── Dragons ──────────────────────────────
  // Clear existing to ensure "all" dragons are fresh or just append missing?
  // User says "bootstrap complete: Dragons: 100", implying we should have them all.
  owner.den = [];
  owner.party = [];

  DRAGONS.forEach((dragon) => {
    const ownedDragon = {
      ...dragon,
      level: 100,
      xp: Number.MAX_SAFE_INTEGER,
      bonded: true,
      owner: OWNER_ID
    };

    owner.den.push(ownedDragon);

    // First N go into party
    if (owner.party.length < MAX_PARTY_SIZE) {
      owner.party.push(ownedDragon);
    }
  });

  // ── Colossal Beasts ───────────────────────
  owner.colossalBeasts = [];

  COLOSSAL_BEASTS.forEach(beast => {
    owner.colossalBeasts.push({
      ...beast,
      unlocked: true,
      owner: OWNER_ID
    });
  });

  // ── Flags ─────────────────────────────────
  owner.isImmortal = true;
  owner.isAdminLocked = true;

  await DB.saveDB('users');

  console.log("👑 Owner bootstrap complete:");
  console.log(`• ID: ${OWNER_ID}`);
  console.log(`• Dragons in Den: ${owner.den.length}`);
  console.log(`• Dragons in Party: ${owner.party.length}`);
  console.log(`• Colossal Beasts: ${owner.colossalBeasts.length}`);
}

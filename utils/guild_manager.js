import DB from './database.js';
import { getRankIndex } from './ranks.js';
import { getPlayerProfile, updatePlayer } from './rpg_user_manager.js';
import { updateLoneWolfTitle } from './title_manager.js';

export const MAX_GUILD_SIZE = 20;

export async function canCreateGuild(player, isPrivileged) {
    const rankIdx = getRankIndex(player.rank || player.progression?.rank);
    // Rank index 10 is Dragonbound Noble
    return rankIdx >= 10 || isPrivileged;
}

export async function createGuild(playerJid, guildName, description, isPrivileged) {
    const guildDb = await DB.getDB('guilds');
    guildDb.guilds = guildDb.guilds || {};

    const player = await getPlayerProfile(playerJid);
    if (!player) throw new Error("Player not found");

    if (!(await canCreateGuild(player, isPrivileged))) {
        throw new Error("Rank too low to create a guild. Required: Dragonbound Noble (Rank 11+)");
    }

    if (guildDb.guilds[guildName]) throw new Error("Guild name already exists");

    const currentGuild = await getPlayerGuild(playerJid);
    if (currentGuild) throw new Error("You are already in a guild.");

    guildDb.guilds[guildName] = {
        name: guildName,
        leader: playerJid,
        members: [playerJid],
        createdAt: Date.now(),
        description: description || "No description",
        rankRequirement: player.rank || player.progression?.rank,
        level: 1,
        xp: 0,
        cooldowns: {},
        stats: {
            dungeonClears: 0,
            bossKills: 0
        }
    };

    await DB.saveDB('guilds');
    await onGuildStatusChange(playerJid, true, isPrivileged);

    return guildDb.guilds[guildName];
}

export async function joinGuild(playerJid, guildName, isPrivileged) {
    const guildDb = await DB.getDB('guilds');
    if (!guildDb.guilds?.[guildName]) throw new Error("Guild not found");

    const player = await getPlayerProfile(playerJid);
    if (!player) throw new Error("Player not found");

    const currentGuild = await getPlayerGuild(playerJid);
    if (currentGuild) throw new Error("You are already in a guild.");

    const guild = guildDb.guilds[guildName];

    if (guild.members.length >= MAX_GUILD_SIZE) {
        throw new Error("Guild is full.");
    }

    if (!guild.members.includes(playerJid)) {
        guild.members.push(playerJid);
    }

    await DB.saveDB('guilds');
    await onGuildStatusChange(playerJid, true, isPrivileged);

    return guild;
}

export async function leaveGuild(playerJid, isPrivileged) {
    const guildDb = await DB.getDB('guilds');
    if (!guildDb.guilds) return;

    let guildFound = null;
    let guildNameFound = null;

    for (const [name, guild] of Object.entries(guildDb.guilds)) {
        if (guild.members.includes(playerJid)) {
            guild.members = guild.members.filter(m => m !== playerJid);
            guildFound = guild;
            guildNameFound = name;
            break;
        }
    }

    if (guildFound) {
        if (guildFound.members.length === 0) {
            delete guildDb.guilds[guildNameFound];
        } else if (guildFound.leader === playerJid) {
            guildFound.leader = guildFound.members[0];
        }
        await DB.saveDB('guilds');
        await onGuildStatusChange(playerJid, false, isPrivileged);
    }
}

export async function getPlayerGuild(playerJid) {
    const guildDb = await DB.getDB('guilds');
    if (!guildDb.guilds) return null;
    return Object.values(guildDb.guilds).find(g => g.members.includes(playerJid)) || null;
}

export async function updateGuild(guild) {
    const guildDb = await DB.getDB('guilds');
    guildDb.guilds[guild.name] = guild;
    await DB.saveDB('guilds');
}

export async function addGuildXP(guildName, amount) {
    const guildDb = await DB.getDB('guilds');
    const guild = guildDb.guilds[guildName];
    if (!guild) return;

    guild.xp += amount;

    // Level up logic (Deterministic: 5000 XP per level)
    const nextLevelXP = guild.level * 5000;
    if (guild.xp >= nextLevelXP) {
        guild.level++;
        guild.xp -= nextLevelXP; // Carrying over extra XP
    }

    await DB.saveDB('guilds');
}

async function onGuildStatusChange(jid, hasGuild, isPrivileged) {
  const player = await getPlayerProfile(jid);
  if (!player) return;
  updateLoneWolfTitle(player, hasGuild, isPrivileged);
  await updatePlayer(player);
}

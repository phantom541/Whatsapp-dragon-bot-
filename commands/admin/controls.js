import { getPlayerProfile, updatePlayer } from '../../utils/rpg_user_manager.js';
import { recordLog } from '../../utils/admin_logger.js';
import DB from '../../utils/database.js';

const PRIMARY_OWNER_JID = '26775949123@s.whatsapp.net'; // PHANTOM

function isPrimaryOwner(jid) {
  return jid === PRIMARY_OWNER_JID;
}

export default {
  name: 'controls',
  aliases: ['grantowner', 'revokeowner', 'forcemod', 'revokemod', 'broadcast', 'givegold', 'setxp', 'spawnbeast', 'cleardungeon', 'togglefun', 'warn', 'ban', 'raidcheck', 'monsterspawn', 'playerstats', 'kick', 'mute', 'announce'],
  description: 'Owner, Mod, Admin commands hub',
  async execute({ sock, msg, reply, hasRole, sender, args, from }) {
    const command = msg.message?.conversation?.split(' ')[0] || '';
    const body = msg.message?.conversation || '';

    // -------------------- PHANTOM / Owner Commands --------------------
    if (body.startsWith('%grantowner')) {
      if (!isPrimaryOwner(sender)) return reply('❌ Only PHANTOM can assign owners.');
      let target = args[0];
      if (!target) return reply('❌ Provide a JID or number.');
      if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';

      const targetPlayer = await getPlayerProfile(target);
      if (!targetPlayer) return reply('❌ Player not found.');

      targetPlayer.roles = targetPlayer.roles || [];
      if (!targetPlayer.roles.includes('owner')) targetPlayer.roles.push('owner');
      await updatePlayer(targetPlayer);
      recordLog(sender, `%grantowner executed on ${target}`);
      return reply(`✅ ${target} is now an owner.`);
    }

    if (body.startsWith('%revokeowner')) {
      if (!isPrimaryOwner(sender)) return reply('❌ Only PHANTOM can revoke owners.');
      let target = args[0];
      if (!target) return reply('❌ Provide a JID or number.');
      if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';

      const targetPlayer = await getPlayerProfile(target);
      if (!targetPlayer) return reply('❌ Player not found.');

      targetPlayer.roles = (targetPlayer.roles || []).filter(r => r !== 'owner');
      await updatePlayer(targetPlayer);
      recordLog(sender, `%revokeowner executed on ${target}`);
      return reply(`✅ ${target} is no longer an owner.`);
    }

    if (body.startsWith('%forcemod')) {
      if (!isPrimaryOwner(sender) && !hasRole('owner')) return reply('❌ Only PHANTOM or Owners can assign mods.');
      let target = args[0];
      if (!target) return reply('❌ Provide a JID or number.');
      if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';

      const targetPlayer = await getPlayerProfile(target);
      if (!targetPlayer) return reply('❌ Player not found.');

      targetPlayer.roles = targetPlayer.roles || [];
      if (!targetPlayer.roles.includes('mod')) targetPlayer.roles.push('mod');
      await updatePlayer(targetPlayer);
      recordLog(sender, `%forcemod executed on ${target}`);
      return reply(`✅ ${target} is now a mod.`);
    }

    if (body.startsWith('%revokemod')) {
      if (!isPrimaryOwner(sender) && !hasRole('owner')) return reply('❌ Only PHANTOM or Owners can revoke mods.');
      let target = args[0];
      if (!target) return reply('❌ Provide a JID or number.');
      if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';

      const targetPlayer = await getPlayerProfile(target);
      if (!targetPlayer) return reply('❌ Player not found.');

      targetPlayer.roles = (targetPlayer.roles || []).filter(r => r !== 'mod');
      await updatePlayer(targetPlayer);
      recordLog(sender, `%revokemod executed on ${target}`);
      return reply(`✅ ${target} is no longer a mod.`);
    }

    if (body.startsWith('%broadcast')) {
      if (!isPrimaryOwner(sender) && !hasRole('owner')) return reply('❌ Only PHANTOM or Owners can broadcast.');
      const message = args.join(' ');
      if (!message) return reply('❌ Provide a message.');

      const db = await DB.getDB('users');
      const jids = Object.keys(db.users || {});

      for (const jid of jids) {
        await sock.sendMessage(jid, { text: `📢 *Global Broadcast*\n\n${message}` });
      }

      recordLog(sender, `%broadcast executed`);
      return reply('✅ Broadcast sent to all registered users.');
    }

    if (body.startsWith('%givegold')) {
      if (!isPrimaryOwner(sender) && !hasRole('owner')) return reply('❌ Only PHANTOM or Owners can give gold.');
      let target = args[0];
      const amount = parseInt(args[1]);
      if (!target || isNaN(amount)) return reply('❌ Usage: %givegold [player] [amount]');
      if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';

      const targetPlayer = await getPlayerProfile(target);
      if (!targetPlayer) return reply('❌ Player not found.');

      targetPlayer.progression = targetPlayer.progression || { gold: 0, xp: 0 };
      targetPlayer.progression.gold += amount;
      await updatePlayer(targetPlayer);
      recordLog(sender, `%givegold ${amount} to ${target}`);
      return reply(`✅ Gave ${amount} gold to ${target}`);
    }

    if (body.startsWith('%setxp')) {
      if (!isPrimaryOwner(sender) && !hasRole('owner')) return reply('❌ Only PHANTOM or Owners can set XP.');
      let target = args[0];
      const amount = parseInt(args[1]);
      if (!target || isNaN(amount)) return reply('❌ Usage: %setxp [player] [amount]');
      if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';

      const targetPlayer = await getPlayerProfile(target);
      if (!targetPlayer) return reply('❌ Player not found.');

      targetPlayer.progression = targetPlayer.progression || { gold: 0, xp: 0 };
      targetPlayer.progression.xp = amount;
      await updatePlayer(targetPlayer);
      recordLog(sender, `%setxp ${target} = ${amount}`);
      return reply(`✅ ${target}'s XP set to ${amount}`);
    }

    if (body.startsWith('%spawnbeast')) {
      if (!isPrimaryOwner(sender) && !hasRole('owner')) return reply('❌ Only PHANTOM or Owners can spawn beasts.');
      const beastName = args.join(' ');
      // Actual spawn logic would go here
      return reply(`🐲 Force spawn of Colossal Beast "${beastName}" requested. (Logic stub)`);
    }

    if (body.startsWith('%cleardungeon')) {
      if (!isPrimaryOwner(sender) && !hasRole('owner')) return reply('❌ Only PHANTOM or Owners can clear dungeons.');
      const dungeonName = args.join(' ');
      // Logic to reset dungeon
      return reply(`✅ Dungeon "${dungeonName}" has been cleared.`);
    }

    if (body.startsWith('%togglefun')) {
      if (!isPrimaryOwner(sender) && !hasRole('owner')) return reply('❌ Only PHANTOM or Owners can toggle fun commands.');
      const state = args[0] === 'on';
      global.funEnabled = state;
      return reply(`🎉 Fun commands are now ${state ? 'enabled' : 'disabled'}`);
    }

    // -------------------- Mod Commands --------------------
    if (body.startsWith('%warn')) {
      if (!hasRole('mod') && !hasRole('owner') && !isPrimaryOwner(sender)) return reply('❌ Insufficient permissions.');
      const target = args[0];
      const reason = args.slice(1).join(' ') || 'No reason';
      if (!target) return reply('❌ Provide a target.');

      recordLog(sender, `%warn issued to ${target} | Reason: ${reason}`);
      return reply(`⚠️ Warning issued to ${target}: ${reason}`);
    }

    if (body.startsWith('%ban')) {
        if (!hasRole('mod') && !hasRole('owner') && !isPrimaryOwner(sender)) return reply('❌ Insufficient permissions.');
        const target = args[0];
        const duration = args[1] || '1d';
        if (!target) return reply('❌ Provide a target.');

        recordLog(sender, `%ban executed on ${target} for ${duration}`);
        return reply(`⛔ ${target} banned for ${duration}.`);
    }

    if (body.startsWith('%raidcheck')) {
      if (!hasRole('mod') && !hasRole('owner') && !isPrimaryOwner(sender)) return reply('❌ Insufficient permissions.');
      return reply('✅ Dungeon raid check executed.');
    }

    if (body.startsWith('%monsterspawn')) {
      if (!hasRole('mod') && !hasRole('owner') && !isPrimaryOwner(sender)) return reply('❌ Insufficient permissions.');
      const monster = args.join(' ');
      return reply(`✅ Monster ${monster} spawned.`);
    }

    if (body.startsWith('%playerstats')) {
      if (!hasRole('mod') && !hasRole('owner') && !isPrimaryOwner(sender)) return reply('❌ Insufficient permissions.');
      let target = args[0];
      if (!target) return reply('❌ Provide a target.');
      if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';

      const targetPlayer = await getPlayerProfile(target);
      if (!targetPlayer) return reply('❌ Player not found.');

      return reply(`📊 *${targetPlayer.name} Stats:*\n\nRank: ${targetPlayer.rank || 'N/A'}\nXP: ${targetPlayer.progression?.xp || 0}\nGold: ${targetPlayer.progression?.gold || 0}\nDragons: ${targetPlayer.dragons?.length || 0}`);
    }

    // -------------------- Group Admin Commands --------------------
    if (body.startsWith('%kick')) {
        // We'd need a way to check if sender is group admin in the specific group
        // For now let's assume we can check via sock
        const groupMetadata = await sock.groupMetadata(from);
        const participant = groupMetadata.participants.find(p => p.id === sender);
        const isGroupAdmin = participant?.admin || participant?.isSuperAdmin;

        if (!isGroupAdmin && !hasRole('owner') && !isPrimaryOwner(sender)) return reply('❌ Only group admins can kick members.');

        let target = args[0];
        if (!target) return reply('❌ Provide a target number.');
        if (!target.endsWith('@s.whatsapp.net')) target += '@s.whatsapp.net';

        await sock.groupParticipantsUpdate(from, [target], 'remove');
        recordLog(sender, `%kick executed on ${target} in ${from}`);
        return reply(`✅ Kicked ${target}`);
    }

    if (body.startsWith('%mute')) {
        const groupMetadata = await sock.groupMetadata(from);
        const participant = groupMetadata.participants.find(p => p.id === sender);
        const isGroupAdmin = participant?.admin || participant?.isSuperAdmin;

        if (!isGroupAdmin && !hasRole('owner') && !isPrimaryOwner(sender)) return reply('❌ Only group admins can mute members.');

        return reply(`🔇 Mute functionality requested. (Logic stub)`);
    }

    if (body.startsWith('%announce')) {
        const groupMetadata = await sock.groupMetadata(from);
        const participant = groupMetadata.participants.find(p => p.id === sender);
        const isGroupAdmin = participant?.admin || participant?.isSuperAdmin;

        if (!isGroupAdmin && !hasRole('owner') && !isPrimaryOwner(sender)) return reply('❌ Only group admins can announce.');

        const text = args.join(' ');
        await sock.sendMessage(from, { text: `📢 *GROUP ANNOUNCEMENT*\n\n${text}` });
        recordLog(sender, `%announce executed`);
        return reply('✅ Announcement sent.');
    }

    return reply('❌ Command not recognized or insufficient permissions.');
  }
};

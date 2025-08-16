// adminGroup.js
function normalizeJid(jid) {
  if (!jid) return null;
  jid = jid.split(':')[0];
  if (!jid.endsWith('@s.whatsapp.net')) jid += '@s.whatsapp.net';
  return jid;
}

async function fetchGroupAdmins(sock, groupId) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    return metadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => normalizeJid(p.id));
  } catch (e) {
    console.error('❌ Gagal ambil metadata grup:', e);
    return [];
  }
}

function extractTargetJid(msg, text) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  if (ctx?.mentionedJid?.length) return normalizeJid(ctx.mentionedJid[0]);
  if (ctx?.participant && ctx?.quotedMessage) return normalizeJid(ctx.participant);

  const parts = text.trim().split(/\s+/);
  let number = parts[1]?.replace(/[^+\d]/g, '');
  if (!number) return null;
  if (number.startsWith('0')) number = '62' + number.slice(1);
  return normalizeJid(`${number}@s.whatsapp.net`);
}

module.exports = async function admin(sock, msg, text) {
  const chatId = msg.key.remoteJid;
  const from = chatId;
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❌ Perintah Admin/unAdmin hanya bisa di grup!' }, { quoted: msg });
  }

  const sender = normalizeJid(msg.key.participant || msg.participant);
  const botId = normalizeJid(sock.user.id);
  const lowerText = text.toLowerCase();
  const isNA = lowerText.startsWith('.na');
  const isUNA = lowerText.startsWith('.una');
  if (!isNA && !isUNA) return false;

  const target = extractTargetJid(msg, text);
  if (!target) return sock.sendMessage(from, { text: '❌ Gagal mengenali user!', }, { quoted: msg });

  // Fetch latest admin list sebelum action
  const groupAdmins = await fetchGroupAdmins(sock, from);
  const targetIsAdmin = groupAdmins.includes(target);
  const senderIsAdmin = groupAdmins.includes(sender);
  const botIsAdmin = groupAdmins.includes(botId);

  if (!senderIsAdmin) {
    return sock.sendMessage(from, { text: '🚫 Perintah ini hanya bisa digunakan oleh admin grup!', }, { quoted: msg });
  }

  if (!botIsAdmin) {
    return sock.sendMessage(from, { text: '❌ Bot harus admin untuk promote/demote!', }, { quoted: msg });
  }

  // PROMOTE
  if (isNA) {
    if (targetIsAdmin) return sock.sendMessage(from, { text: `⚠️ User @${target.split('@')[0]} sudah Admin!`, mentions: [target] }, { quoted: msg });
    try {
      await sock.groupParticipantsUpdate(from, [target], 'promote');
      return sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} sekarang Admin!`, mentions: [target] }, { quoted: msg });
    } catch (e) {
      console.error('❌ Promote gagal:', e);
      return sock.sendMessage(from, { text: '❌ Gagal promote user!' }, { quoted: msg });
    }
  }

  // DEMOTE
  if (isUNA) {
    if (target === botId) return sock.sendMessage(from, { text: '❌ Bot tidak bisa demote sendiri!', }, { quoted: msg });
    if (!targetIsAdmin) return sock.sendMessage(from, { text: `⚠️ User @${target.split('@')[0]} bukan Admin!`, mentions: [target] }, { quoted: msg });
    try {
      await sock.groupParticipantsUpdate(from, [target], 'demote');
      return sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} dicabut admin!`, mentions: [target] }, { quoted: msg });
    } catch (e) {
      console.error('❌ Demote gagal:', e);
      return sock.sendMessage(from, { text: '❌ Gagal demote user!' }, { quoted: msg });
    }
  }

  return false;
};

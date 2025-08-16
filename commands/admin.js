// adminGroup.js
module.exports = async function admin(sock, msg, text) {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');

  if (!isGroup) {
    return sock.sendMessage(chatId, {
      text: '❌ Perintah Admin/unAdmin hanya bisa digunakan di grup!',
    }, { quoted: msg });
  }

  const sender = msg.key.participant || msg.participant;
  const lowerText = text.toLowerCase();
  const isNA = lowerText.startsWith('.na');   // promote
  const isUNA = lowerText.startsWith('.una'); // demote
  if (!isNA && !isUNA) return false;

  // ambil metadata grup
  const metadata = await sock.groupMetadata(chatId);

  // fungsi normalize JID untuk hapus device suffix
  const normalizeJid = jid => jid?.split(':')[0] || '';

  // daftar admin grup
  const groupAdmins = metadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => normalizeJid(p.id));

  if (!groupAdmins.includes(normalizeJid(sender))) {
    return sock.sendMessage(chatId, {
      text: '🚫 Perintah ini hanya bisa digunakan oleh *admin grup*!',
    }, { quoted: msg });
  }

  // ambil target: tag, reply, atau nomor
  let target = null;
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;

  if (contextInfo?.mentionedJid?.length) target = contextInfo.mentionedJid[0];
  else if (contextInfo?.participant && contextInfo?.quotedMessage) target = contextInfo.participant;
  else {
    const parts = text.trim().split(/\s+/);
    let number = parts[1]?.replace(/[^+\d]/g, '');
    if (number?.startsWith('0')) number = '62' + number.slice(1);
    if (number) target = `${number}@s.whatsapp.net`;
  }

  if (!target || typeof target !== 'string' || !target.endsWith('@s.whatsapp.net')) {
    return sock.sendMessage(chatId, {
      text: '❌ Gagal mengenali user! Tag, reply, atau tulis nomor dengan benar.',
    }, { quoted: msg });
  }

  const normalizedTarget = normalizeJid(target);
  const targetIsAdmin = groupAdmins.includes(normalizedTarget);
  const botId = normalizeJid(sock.user.id);

  // PROMOTE
  if (isNA) {
    if (targetIsAdmin) {
      return sock.sendMessage(chatId, {
        text: `⚠️ User @${normalizedTarget} sudah Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'promote');
      return sock.sendMessage(chatId, {
        text: `✅ Berhasil menjadikan @${normalizedTarget} Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal promote:', e);
      return sock.sendMessage(chatId, { text: '❌ Bot harus admin untuk promote!' }, { quoted: msg });
    }
  }

  // DEMOTE
  if (isUNA) {
    if (normalizedTarget === botId) {
      return sock.sendMessage(chatId, { text: '❌ Bot tidak bisa demote sendiri!' }, { quoted: msg });
    }

    if (!targetIsAdmin) {
      return sock.sendMessage(chatId, {
        text: `⚠️ User @${normalizedTarget} bukan Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'demote');
      return sock.sendMessage(chatId, {
        text: `✅ User @${normalizedTarget} telah dicabut Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal demote:', e);
      return sock.sendMessage(chatId, { text: '❌ Bot harus admin untuk demote!' }, { quoted: msg });
    }
  }

  return false;
};

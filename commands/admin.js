// adminGroup.js
module.exports = async function admin(sock, msg, text) {
  const chatId = msg.key.remoteJid;
  const from = chatId;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    return sock.sendMessage(from, {
      text: '❌ Perintah Admin/unAdmin hanya bisa digunakan di grup!',
    }, { quoted: msg });
  }

  const sender = msg.key.participant || msg.participant;
  const lowerText = text.toLowerCase();
  const isNA = lowerText.startsWith('.na');   // promote
  const isUNA = lowerText.startsWith('.una'); // demote
  if (!isNA && !isUNA) return false;

  // Ambil metadata grup dan list admin
  const metadata = await sock.groupMetadata(from);
  const groupAdmins = metadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id.split(':')[0]); // normalize JID tanpa extra

  if (!groupAdmins.includes(sender.split(':')[0])) {
    return sock.sendMessage(from, {
      text: '🚫 Perintah ini hanya bisa digunakan oleh *admin grup*!',
    }, { quoted: msg });
  }

  // Extract target JID: tag, reply, atau nomor manual
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
    return sock.sendMessage(from, {
      text: '❌ Gagal mengenali user! Tag, reply, atau tulis nomor dengan benar.',
    }, { quoted: msg });
  }

  const normalizedTarget = target.split('@')[0];
  const targetFullJid = target.split(':')[0]; // remove possible device suffix
  const targetIsAdmin = groupAdmins.includes(targetFullJid);
  const botId = sock.user.id.split(':')[0];

  // PROMOTE
  if (isNA) {
    if (targetIsAdmin) {
      return sock.sendMessage(from, {
        text: `⚠️ User @${normalizedTarget} sudah Admin Grup`,
        mentions: [targetFullJid]
      }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(from, [targetFullJid], 'promote');
      return sock.sendMessage(from, {
        text: `✅ Berhasil menjadikan @${normalizedTarget} Admin Grup`,
        mentions: [targetFullJid]
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal promote:', e);
      return sock.sendMessage(from, { text: '❌ Bot harus admin untuk promote!' }, { quoted: msg });
    }
  }

  // DEMOTE
  if (isUNA) {
    if (targetFullJid === botId) {
      return sock.sendMessage(from, { text: '❌ Bot tidak bisa demote sendiri!' }, { quoted: msg });
    }

    if (!targetIsAdmin) {
      return sock.sendMessage(from, {
        text: `⚠️ User @${normalizedTarget} bukan Admin Grup`,
        mentions: [targetFullJid]
      }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(from, [targetFullJid], 'demote');
      return sock.sendMessage(from, {
        text: `✅ User @${normalizedTarget} telah dicabut Admin Grup`,
        mentions: [targetFullJid]
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal demote:', e);
      return sock.sendMessage(from, { text: '❌ Bot harus admin untuk demote!' }, { quoted: msg });
    }
  }

  return false;
};

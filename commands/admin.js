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

  // ambil metadata grup dan admin
  let metadata;
  try {
    metadata = await sock.groupMetadata(chatId);
  } catch (e) {
    console.error('❌ Gagal ambil metadata grup:', e);
    return sock.sendMessage(chatId, { text: '⚠️ Gagal ambil metadata grup, coba lagi nanti' }, { quoted: msg });
  }

  const groupAdmins = metadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id);

  if (!groupAdmins.includes(sender)) {
    return sock.sendMessage(chatId, {
      text: '🚫 Perintah ini hanya bisa digunakan oleh *admin grup*!',
    }, { quoted: msg });
  }

  // Extract target JID
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

  const targetIsAdmin = groupAdmins.includes(target);
  const botId = sock.user.id;

  // PROMOTE
  if (isNA) {
    if (targetIsAdmin) {
      return sock.sendMessage(chatId, {
        text: `⚠️ User @${target.split('@')[0]} sudah Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'promote');
      return sock.sendMessage(chatId, {
        text: `✅ Berhasil menjadikan @${target.split('@')[0]} Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal promote:', e);
      return sock.sendMessage(chatId, { text: '❌ Bot harus admin untuk promote!' }, { quoted: msg });
    }
  }

  // DEMOTE
  if (isUNA) {
    if (target === botId) {
      return sock.sendMessage(chatId, { text: '❌ Bot tidak bisa demote sendiri!' }, { quoted: msg });
    }

    if (!targetIsAdmin) {
      return sock.sendMessage(chatId, {
        text: `⚠️ User @${target.split('@')[0]} bukan Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'demote');
      return sock.sendMessage(chatId, {
        text: `✅ User @${target.split('@')[0]} telah dicabut Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal demote:', e);
      return sock.sendMessage(chatId, { text: '❌ Bot harus admin untuk demote!' }, { quoted: msg });
    }
  }

  return false;
};

// Global handler (letakkan di index.js)
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
});

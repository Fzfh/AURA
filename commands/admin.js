// admin.js
const { default: makeWASocket } = require('@whiskeysockets/baileys');

function normalizeJid(jid) {
  if (!jid) return null;
  return jid.split(':')[0]; // hapus suffix :12345
}

async function isGroupAdmin(sock, groupId, jid) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    return metadata.participants.some(
      p => normalizeJid(p.id) === normalizeJid(jid) &&
           (p.admin === 'admin' || p.admin === 'superadmin')
    );
  } catch (e) {
    console.error('❌ Gagal ambil metadata grup:', e);
    return false;
  }
}

function extractTargetJid(msg, text) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;

  // kalau tag
  if (contextInfo?.mentionedJid?.length) return contextInfo.mentionedJid[0];

  // kalau reply
  if (contextInfo?.participant && contextInfo?.quotedMessage) return contextInfo.participant;

  // fallback manual number
  const parts = text.trim().split(/\s+/);
  let number = parts[1]?.replace(/[^+\d]/g, '');
  if (!number) return null;

  if (number.startsWith('0')) number = '62' + number.slice(1);
  return `${number}@s.whatsapp.net`;
}

module.exports = async function admin(sock, msg, text) {
  const chatId = msg.key.remoteJid;
  if (!chatId.endsWith('@g.us')) {
    await sock.sendMessage(chatId, { text: '❌ Perintah Admin/unAdmin hanya bisa digunakan di grup' }, { quoted: msg });
    return true;
  }

  const sender = msg.key.participant || msg.key.remoteJid;
  const lowerText = text.toLowerCase();
  const isNA = lowerText.startsWith('.na');   // promote
  const isUNA = lowerText.startsWith('.una'); // demote
  if (!isNA && !isUNA) return false;

  const senderIsAdmin = await isGroupAdmin(sock, chatId, sender);
  if (!senderIsAdmin) {
    await sock.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa pakai perintah ini' }, { quoted: msg });
    return true;
  }

  const target = extractTargetJid(msg, text);
  if (!target) {
    await sock.sendMessage(chatId, { text: '❌ Gagal mengenali user. Tag, reply, atau tulis nomor!' }, { quoted: msg });
    return true;
  }

  const targetIsAdmin = await isGroupAdmin(sock, chatId, target);
  const botId = sock.user.id;

  // PROMOTE
  if (isNA) {
    if (targetIsAdmin) {
      await sock.sendMessage(chatId, {
        text: `⚠️ User @${target.split('@')[0]} sudah Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
      return true;
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'promote');
      await sock.sendMessage(chatId, {
        text: `✅ Berhasil menjadikan @${target.split('@')[0]} Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal promote:', e);
      await sock.sendMessage(chatId, { text: '❌ Bot harus admin untuk promote!' }, { quoted: msg });
    }
    return true;
  }

  // DEMOTE
  if (isUNA) {
    if (normalizeJid(target) === normalizeJid(botId)) {
      await sock.sendMessage(chatId, { text: '❌ Bot tidak bisa demote sendiri!' }, { quoted: msg });
      return true;
    }

    if (!targetIsAdmin) {
      await sock.sendMessage(chatId, {
        text: `⚠️ User @${target.split('@')[0]} bukan Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
      return true;
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'demote');
      await sock.sendMessage(chatId, {
        text: `✅ User @${target.split('@')[0]} telah dicabut Admin Grup`,
        mentions: [target]
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal demote:', e);
      await sock.sendMessage(chatId, { text: '❌ Bot harus admin untuk demote!' }, { quoted: msg });
    }
    return true;
  }

  return false;
};

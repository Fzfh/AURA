// adminGroup.js
async function getGroupAdmins(sock, groupId) {
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

function normalizeJid(jid) {
  if (!jid) return null;
  jid = jid.split(':')[0]; // buang device ID
  if (!jid.endsWith('@s.whatsapp.net')) jid += '@s.whatsapp.net';
  return jid;
}

function extractTargetJid(msg, text) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;

  if (contextInfo?.mentionedJid?.length) return normalizeJid(contextInfo.mentionedJid[0]);
  if (contextInfo?.participant && contextInfo?.quotedMessage) return normalizeJid(contextInfo.participant);

  const parts = text.trim().split(/\s+/);
  let number = parts[1]?.replace(/[^+\d]/g, '');
  if (!number) return null;
  if (number.startsWith('0')) number = '62' + number.slice(1);
  return normalizeJid(`${number}@s.whatsapp.net`);
}

module.exports = async function admin(sock, msg, text) {
  const chatId = msg.key.remoteJid;
  const from = chatId;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    return sock.sendMessage(from, {
      text: '❌ Perintah Admin/unAdmin hanya bisa digunakan di grup!',
    }, { quoted: msg });
  }

  const sender = normalizeJid(msg.key.participant || msg.participant);
  const botId = normalizeJid(sock.user.id);
  const lowerText = text.toLowerCase();
  const isNA = lowerText.startsWith('.na');   // promote
  const isUNA = lowerText.startsWith('.una'); // demote
  if (!isNA && !isUNA) return false;

  const groupAdmins = await getGroupAdmins(sock, from);

  if (!groupAdmins.includes(sender)) {
    return sock.sendMessage(from, {
      text: '🚫 Perintah ini hanya bisa digunakan oleh *admin grup*!',
    }, { quoted: msg });
  }

  const target = extractTargetJid(msg, text);
  if (!target) {
    return sock.sendMessage(from, {
      text: '❌ Gagal mengenali user! Tag, reply, atau tulis nomor dengan benar.',
    }, { quoted: msg });
  }

  const targetIsAdmin = groupAdmins.includes(target);
  const botIsAdmin = groupAdmins.includes(botId);

  if (!botIsAdmin) {
    return sock.sendMessage(from, { text: '❌ Bot harus admin untuk promote/demote!' }, { quoted: msg });
  }

  // PROMOTE
  if (isNA) {
    if (targetIsAdmin) {
      return sock.sendMessage(from, {
        text: `⚠️ User @${target.split('@')[0]} sudah Admin Grup`,
        mentions: [target],
      }, { quoted: msg });
    }
    try {
      await sock.groupParticipantsUpdate(from, [target], 'promote');
      return sock.sendMessage(from, {
        text: `✅ Berhasil menjadikan @${target.split('@')[0]} Admin Grup`,
        mentions: [target],
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal promote:', e);
      return sock.sendMessage(from, { text: '❌ Gagal promote user!' }, { quoted: msg });
    }
  }

  // DEMOTE
  if (isUNA) {
    if (target === botId) {
      return sock.sendMessage(from, { text: '❌ Bot tidak bisa demote sendiri!' }, { quoted: msg });
    }

    if (!targetIsAdmin) {
      return sock.sendMessage(from, {
        text: `⚠️ User @${target.split('@')[0]} bukan Admin Grup`,
        mentions: [target],
      }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(from, [target], 'demote');
      return sock.sendMessage(from, {
        text: `✅ User @${target.split('@')[0]} telah dicabut Admin Grup`,
        mentions: [target],
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal demote:', e);
      return sock.sendMessage(from, { text: '❌ Gagal menurunkan admin!' }, { quoted: msg });
    }
  }

  return false;
};

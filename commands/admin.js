function extractTargetJid(sock, msg, text) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const mentioned = contextInfo?.mentionedJid;
  if (mentioned && mentioned.length > 0) return mentioned[0];

  if (contextInfo?.participant && contextInfo?.quotedMessage) {
    return contextInfo.participant;
  }

  const parts = text.split(' ');
  if (parts.length >= 2) {
    const number = parts[1].replace(/\D/g, '');
    if (number.length >= 8) return number + '@s.whatsapp.net';
  }

  return null;
}

async function isGroupAdmin(sock, groupId, jid) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    return metadata.participants.some(p => p.id === jid && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch (e) {
    console.error('❌ Gagal ambil metadata grup:', e);
    return false;
  }
}

module.exports = async function admin(sock, msg, text, sender, chatId) {
  const lowerText = text.toLowerCase();
  const isNA = lowerText.startsWith('.na');
  const isUNA = lowerText.startsWith('.una');

  if (!isNA && !isUNA) return false; // ❌ Bukan command admin

  if (!chatId.endsWith('@g.us')) {
    await sock.sendMessage(chatId, {
      text: '❌ Command ini hanya bisa dijalankan di grup.',
    }, { quoted: msg });
    return true;
  }

  const isSenderAdmin = await isGroupAdmin(sock, chatId, sender);
  if (!isSenderAdmin) {
    await sock.sendMessage(chatId, {
      text: '❌ Kamu bukan admin grup.',
    }, { quoted: msg });
    return true;
  }

  const target = extractTargetJid(sock, msg, text);
  if (!target) {
    await sock.sendMessage(chatId, {
      text: '❌ Gagal mengenali user.',
    }, { quoted: msg });
    return true;
  }

  const targetIsAdmin = await isGroupAdmin(sock, chatId, target);

  if (isNA) {
    if (targetIsAdmin) {
      await sock.sendMessage(chatId, {
        text: `⚠️ User @${target.split('@')[0]} sudah menjadi *admin grup*!`,
        mentions: [target],
      }, { quoted: msg });
      return true;
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'promote');
      await sock.sendMessage(chatId, {
        text: `✅ Berhasil menjadikan @${target.split('@')[0]} sebagai *admin grup*!`,
        mentions: [target],
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal promote:', e);
      await sock.sendMessage(chatId, {
        text: '❌ Gagal menaikkan jabatan user. Pastikan bot adalah admin.',
      }, { quoted: msg });
    }

    return true;
  }

  if (isUNA) {
    if (!targetIsAdmin) {
      await sock.sendMessage(chatId, {
        text: `⚠️ User @${target.split('@')[0]} bukan admin grup.`,
        mentions: [target],
      }, { quoted: msg });
      return true;
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'demote');
      await sock.sendMessage(chatId, {
        text: `✅ Jabatan admin @${target.split('@')[0]} telah dicabut.`,
        mentions: [target],
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal demote:', e);
      await sock.sendMessage(chatId, {
        text: '❌ Gagal menurunkan jabatan user. Pastikan bot adalah admin grup.',
      }, { quoted: msg });
    }

    return true;
  }
};

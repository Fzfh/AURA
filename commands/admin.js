buat kode ini
function extractTargetJid(sock, msg, text) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const mentioned = contextInfo?.mentionedJid;
  
  if (mentioned && mentioned.length > 0) {
    return mentioned[0];
  }

  if (contextInfo?.participant && contextInfo?.quotedMessage) {
    return contextInfo.participant;
  }

  const parts = text.trim().split(/\s+/);
  let number = parts.slice(1).join('').replace(/[^+\d]/g, '');

  if (number.startsWith('+')) {
    number = number.slice(1);
  } else if (number.startsWith('0')) {
    number = '62' + number.slice(1);
  }

  if (/^\d{8,}$/.test(number)) {
    return `${number}@s.whatsapp.net`;
  }

  return null;
}

async function isGroupAdmin(sock, groupId, jid) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    return metadata.participants.some(
      p => p.id === jid && (p.admin === 'admin' || p.admin === 'superadmin')
    );
  } catch (e) {
    console.error('❌ Gagal ambil metadata grup:', e);
    return false;
  }
}

module.exports = async function admin(sock, msg, text, senderRaw, chatIdInput) {
  const sender = senderRaw || msg.key.participant || msg.participant || msg.key.remoteJid;
  const lowerText = text.toLowerCase();
  const isNA = lowerText.startsWith('.na');
  const isUNA = lowerText.startsWith('.una');

  if (!isNA && !isUNA) return false;

  const chatId = chatIdInput || msg.key.remoteJid;

  if (!chatId.endsWith('@g.us')) {
    await sock.sendMessage(chatId, {
      text: '❌ Perintah Admin/unAdmin ini hanya bisa digunakan di grup',
    }, { quoted: msg });
    return true;
  }

  const isSenderAdmin = await isGroupAdmin(sock, chatId, sender);
  if (!isSenderAdmin) {
    await sock.sendMessage(chatId, {
      text: '❌ Maaf yaaa, Yang boleh Admin/unAdmin hanya admin grup saja',
    }, { quoted: msg });
    return true;
  }

  const target = extractTargetJid(sock, msg, text);

  if (!target || typeof target !== 'string' || !target.endsWith('@s.whatsapp.net')) {
    await sock.sendMessage(chatId, {
      text: '❌ Gagal mengenali user yang kamu maksud \nCoba tag, reply, atau tulis nomornya!',
    }, { quoted: msg });
    return true;
  }

  const targetIsAdmin = await isGroupAdmin(sock, chatId, target);

  if (isNA) {
    if (targetIsAdmin) {
      await sock.sendMessage(chatId, {
        text: `⚠️ User @${target.split('@')[0]} sudah jadi *Admin Grup*!`,
        mentions: [target]
      }, { quoted: msg });
      return true;
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'promote');
      await sock.sendMessage(chatId, {
        text: `✅ Berhasil menjadikan @${target.split('@')[0]} sebagai *Admin Grup*!`,
        mentions: [target]
      }, { quoted: msg });
    } catch (e) {
      console.error('❌ Gagal promote:', e);
      await sock.sendMessage(chatId, {
        text: '❌ Gagal Promote Admin. Pastikan bot punya akses admin yaa',
      }, { quoted: msg });
    }

    return true;
  }

 if (isUNA) {
  const getPureNumber = jid => jid.split('@')[0].split(':')[0];

  if (getPureNumber(target) === getPureNumber(sock.user.id)) {
    await sock.sendMessage(chatId, {
      text: `❌ *NGGAK BOLEH UNADMIN BOT SENDIRI DONGG!* !`,
    }, { quoted: msg });
    return true;
  }

  if (!targetIsAdmin) {
    await sock.sendMessage(chatId, {
      text: `⚠️ User @${target.split('@')[0]} Memang bukan *Admin Grup* kok`,
      mentions: [target]
    }, { quoted: msg });
    return true;
  }

  try {
    await sock.groupParticipantsUpdate(chatId, [target], 'demote');
    await sock.sendMessage(chatId, {
      text: `✅ User @${target.split('@')[0]} telah dicabut sebagai *Admin Grup*`,
      mentions: [target]
    }, { quoted: msg });
  } catch (e) {
    console.error('❌ Gagal demote:', e);
    await sock.sendMessage(chatId, {
      text: '❌ Gagal menurunkan user. Pastikan bot adalah admin grup yaa',
    }, { quoted: msg });
  }

  return true;
}

  return false;
};

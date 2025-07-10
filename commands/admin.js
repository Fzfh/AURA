const { adminList } = require('../setting/setting');

function extractTargetJid(msg, text) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const mentioned = contextInfo?.mentionedJid;
  if (mentioned && mentioned.length > 0) return mentioned[0];

  const parts = text.split(' ');
  if (parts.length >= 2) {
    const number = parts[1].replace(/\D/g, '');
    if (number.length >= 8) return number + '@s.whatsapp.net';
  }

  return null;
}

async function addAdmin(sock, msg, sender, userId, text) {
  if (!adminList.includes(userId)) {
    return sock.sendMessage(sender, {
      text: '❌ Kamu bukan admin bot. Tidak bisa naikkin jabatan orang.',
    }, { quoted: msg });
  }

  const target = extractTargetJid(msg, text);
  if (!target) {
    return sock.sendMessage(sender, {
      text: '❌ Gagal mengenali user yang ingin dijadikan admin.',
    }, { quoted: msg });
  }

  try {
    await sock.groupParticipantsUpdate(sender, [target], 'promote');
    await sock.sendMessage(sender, {
      text: `✅ Berhasil menjadikan @${target.split('@')[0]} sebagai *admin grup*!`,
      mentions: [target],
    }, { quoted: msg });
  } catch (e) {
    console.error('❌ Gagal promote:', e);
    await sock.sendMessage(sender, {
      text: '❌ Gagal menaikkan jabatan user. Pastikan bot punya akses admin.',
    }, { quoted: msg });
  }
}

async function removeAdmin(sock, msg, sender, userId, text) {
  if (!adminList.includes(userId)) {
    return sock.sendMessage(sender, {
      text: '❌ Kamu bukan admin bot. Tidak bisa nurunin jabatan orang.',
    }, { quoted: msg });
  }

  const target = extractTargetJid(msg, text);
  if (!target) {
    return sock.sendMessage(sender, {
      text: '❌ Gagal mengenali user yang ingin dihapus adminnya.',
    }, { quoted: msg });
  }

  try {
    await sock.groupParticipantsUpdate(sender, [target], 'demote');
    await sock.sendMessage(sender, {
      text: `✅ Berhasil menghapus jabatan admin dari @${target.split('@')[0]}.`,
      mentions: [target],
    }, { quoted: msg });
  } catch (e) {
    console.error('❌ Gagal demote:', e);
    await sock.sendMessage(sender, {
      text: '❌ Gagal menurunkan jabatan user. Pastikan bot adalah admin grup.',
    }, { quoted: msg });
  }
}

module.exports = {
  addAdmin,
  removeAdmin
};

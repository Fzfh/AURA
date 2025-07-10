const { adminList } = require('../setting/setting');

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

async function isAdmin(sock, groupId, jid) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    return metadata.participants.some(p => p.id === jid && p.admin);
  } catch (e) {
    console.error('❌ Gagal ambil metadata grup:', e);
    return false;
  }
}

async function addAdmin(sock, msg, sender, userId, text) {
  if (!adminList.includes(userId)) {
    return sock.sendMessage(sender, {
      text: '❌ Kamu bukan admin bot. Tidak bisa naikkin jabatan orang.',
    }, { quoted: msg });
  }

  const target = extractTargetJid(sock, msg, text);
  if (!target) {
    return sock.sendMessage(sender, {
      text: '❌ Gagal mengenali user yang ingin dijadikan admin.',
    }, { quoted: msg });
  }

  if (!sender.endsWith('@g.us')) {
    return sock.sendMessage(sender, {
      text: '❌ Command ini hanya bisa dijalankan di grup.',
    }, { quoted: msg });
  }

  const alreadyAdmin = await isAdmin(sock, sender, target);
  if (alreadyAdmin) {
    return sock.sendMessage(sender, {
      text: `⚠️ User @${target.split('@')[0]} sudah menjadi *admin grup*!`,
      mentions: [target],
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

  const target = extractTargetJid(sock, msg, text);
  if (!target) {
    return sock.sendMessage(sender, {
      text: '❌ Gagal mengenali user yang ingin dihapus adminnya.',
    }, { quoted: msg });
  }

  if (!sender.endsWith('@g.us')) {
    return sock.sendMessage(sender, {
      text: '❌ Command ini hanya bisa dijalankan di grup.',
    }, { quoted: msg });
  }

  const alreadyAdmin = await isAdmin(sock, sender, target);
  if (!alreadyAdmin) {
    return sock.sendMessage(sender, {
      text: `⚠️ User @${target.split('@')[0]} bukan admin grup.`,
      mentions: [target],
    }, { quoted: msg });
  }

  try {
    await sock.groupParticipantsUpdate(sender, [target], 'demote');
    await sock.sendMessage(sender, {
      text: `✅ Jabatan admin @${target.split('@')[0]} telah dicabut.`,
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

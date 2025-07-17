
module.exports = async function handleDelete(sock, msg, store) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!msg.message?.extendedTextMessage?.contextInfo?.stanzaId) {
    return sock.sendMessage(from, {
      text: '❌ Balas pesan yang ingin dihapus dengan mengetik *.del*',
    }, { quoted: msg }); 
  }

  if (isGroup) {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);

    if (!admins.includes(sender)) {
      return sock.sendMessage(from, {
        text: '🚫 Hanya admin grup yang boleh menggunakan perintah *.del*!',
      }, { quoted: msg });
    }
  } else {
    return sock.sendMessage(from, {
      text: '⚠️ Perintah *.del* hanya bisa digunakan di dalam grup!',
    }, { quoted: msg });
  }

  const targetMsg = {
    remoteJid: from,
    fromMe: false,
    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
    participant: msg.message.extendedTextMessage.contextInfo.participant,
  };

  try {
    await sock.sendMessage(from, {
      delete: targetMsg,
    });
  } catch (e) {
    console.error('❌ Gagal hapus pesan:', e);
    await sock.sendMessage(from, {
      text: '❌ Gagal menghapus pesan. Mungkin karena pesan sudah kadaluarsa atau bukan dari bot.',
    }, { quoted: msg });
  }
};

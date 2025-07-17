module.exports = async function openCloseGroup(sock, msg, text, args, commandName) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    return sock.sendMessage(from, {
      text: '❌ Perintah ini hanya bisa digunakan di grup!',
    }, { quoted: msg });
  }

  const sender = msg.key.participant || msg.participant;
  const groupMetadata = await sock.groupMetadata(from);
  const groupAdmins = groupMetadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id);

  if (!groupAdmins.includes(sender)) {
    return sock.sendMessage(from, {
      text: '🚫 Perintah ini hanya bisa digunakan oleh *admin grup*!',
    }, { quoted: msg });
  }

  const isOpen = commandName === 'open';
  const isClose = commandName === 'close';

  if (!isOpen && !isClose) {
    return sock.sendMessage(from, {
      text: '❗ Ketik `.open` atau `.close` dengan benar yaa~',
    }, { quoted: msg });
  }

  const action = isOpen ? 'not_announcement' : 'announcement';
  const statusText = isOpen
    ? '🔓 Grup telah *dibuka*!\nSekarang semua anggota bisa mengirim pesan.'
    : '🔒 Grup telah *ditutup*!\nSekarang hanya admin yang bisa mengirim pesan.';

  try {
    await sock.groupSettingUpdate(from, action);
    await sock.sendMessage(from, {
      text: statusText,
    }, { quoted: msg });
    
  } catch (err) {
    console.error('❌ Gagal mengubah pengaturan grup:', err);
    await sock.sendMessage(from, {
      text: '❌ Gagal mengubah pengaturan grup. Coba lagi nanti yaa~',
    }, { quoted: msg });
  }
};

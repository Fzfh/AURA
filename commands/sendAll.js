const { adminList } = require('../setting/setting');

module.exports = {
  name: 'sa',
  async handler(sock, msg, args, from) {
    const sender = msg.key.remoteJid;

    // Cek apakah pengirim adalah admin
    if (!adminList.includes(sender)) {
      return sock.sendMessage(from, { text: '❌ Hanya admin yang bisa pakai perintah ini!' });
    }

    // Cek apakah command dikirim dari private chat
    const isFromPrivate = !from.endsWith('@g.us');
    if (!isFromPrivate) {
      return sock.sendMessage(from, { text: '⚠️ Command ini hanya bisa dipakai di private chat!' });
    }

    // Ambil isi pesan
    const text = args.join(' ');
    if (!text) {
      return sock.sendMessage(from, { text: '⚠️ Harap masukkan teks setelah .sa' });
    }

    // Ambil semua grup yang bot gabung
    const allChats = await sock.groupFetchAllParticipating();
    const groupList = Object.values(allChats);

    let totalSent = 0;

    for (const group of groupList) {
      const metadata = await sock.groupMetadata(group.id);
      const isSenderInGroup = metadata.participants.some(p => p.id === sender);

      if (!isSenderInGroup) continue;

      const members = metadata.participants.map(p => p.id).filter(id => id !== sock.user.id);

      const messagePayload = {
        text: text,
        contextInfo: {
          messageStubType: 20,
          quotedMessage: { messageContextInfo: {} },
          externalAdReply: {
            title: 'Aura Bot 💫',
            body: 'Status',
            mediaType: 1,
            showAdAttribution: true,
            thumbnail: null
          }
        }
      };

      for (const member of members) {
        try {
          await sock.sendMessage(member, messagePayload);
          totalSent++;
          await delay(1500); // jeda biar nggak ke-detect spam
        } catch (err) {
          console.log(`❌ Gagal kirim ke ${member}:`, err.message);
        }
      }
    }

    await sock.sendMessage(from, { text: `✅ Terkirim ke ${totalSent} pengguna dari grup yang kamu ikuti.` });
  }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

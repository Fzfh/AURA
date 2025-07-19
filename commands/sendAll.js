const { adminList } = require('../setting/setting');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendAll(sock, senderJid, text) {
  if (!adminList.includes(senderJid)) {
    await sock.sendMessage(senderJid, {
      text: '❌ Kamu tidak punya izin untuk menjalankan perintah ini.'
    });
    return;
  }

  const botNumber = sock.user.id;
  const groups = await sock.groupFetchAllParticipating();
  const groupIds = Object.keys(groups);
  const uniqueContacts = new Set();

  for (const gid of groupIds) {
    const group = groups[gid];
    const isSenderInGroup = group.participants.some(p => String(p.id) === String(senderJid));
    if (!isSenderInGroup) continue;

    for (const participant of group.participants) {
      const jid = String(participant.id);
      if (jid !== senderJid && jid !== botNumber) {
        uniqueContacts.add(jid); // pastikan isinya string
      }
    }
  }

  for (const jid of uniqueContacts) {
    try {
      await sock.sendMessage(jid, {
        text: text, // pesan utama dari command, contoh: ".send halo"
        contextInfo: {
          messageStubType: 20, // bikin efek balasan status
          quotedMessage: {
            messageContextInfo: {}, // untuk validasi internal biar nggak error
          },
          externalAdReply: {
            title: 'Aura Bot 💫',
            body: 'Status',
            mediaType: 1,
            showAdAttribution: true,
            thumbnail: null // kamu bisa isi buffer kalau mau ada gambar
          }
        }
      });

      await delay(1200); // delay antar pengiriman biar aman
    } catch (err) {
      console.error(`❌ Gagal kirim ke ${jid}:`, err.message);
    }
  }
}

module.exports = sendAll;

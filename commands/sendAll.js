const { adminList } = require('../setting/setting');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function handler({ sock, msg, senderJid, text }) {
  const from = msg.key.remoteJid;

  if (!adminList.includes(senderJid)) {
    await sock.sendMessage(senderJid, {
      text: '❌ Kamu tidak punya izin untuk menjalankan perintah ini.'
    });
    return;
  }

  await sock.sendMessage(from, {
    text: '🔄 Mengirim ke semua kontak yang 1 grup...'
  }, { quoted: msg });

  const botNumber = sock.user.id;
  const groups = await sock.groupFetchAllParticipating();
  const groupIds = Object.keys(groups);
  const uniqueContacts = new Set();

  for (const gid of groupIds) {
    const group = groups[gid];
    const isSenderInGroup = group.participants.some(p => p.id === senderJid);
    if (!isSenderInGroup) continue;

    for (const participant of group.participants) {
      const jid = participant.id;
      if (jid !== senderJid && jid !== botNumber) {
        uniqueContacts.add(jid);
      }
    }
  }

  for (const jid of uniqueContacts) {
    try {
      await sock.sendMessage(jid, {
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
      });

      await delay(1200);
    } catch (err) {
      console.error(`❌ Gagal kirim ke ${jid}:`, err.message);
    }
  }

  await sock.sendMessage(from, {
    text: '✅ Pesan berhasil dikirim!'
  }, { quoted: msg });
}

module.exports = handler;

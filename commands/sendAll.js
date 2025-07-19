const { adminList } = require('../setting/setting'); // ✅ Tambahin ini!
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function handler(sock, msg, body, args, commandName) {
  if (!msg || !msg.key || !msg.key.remoteJid) {
    console.error("❌ msg tidak valid di sendAll.js");
    return;
  }

  const senderJid = msg.key.participant || msg.key.remoteJid;
  const from = msg.key.remoteJid;
  const text = body;

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

  let count = 0;
  for (const jid of uniqueContacts) {
    try {
      await sock.sendMessage(jid, { text });
      count++;
    } catch (err) {
      console.error(`❌ Gagal kirim ke ${jid}:`, err);
    }
    await delay(2000);
  }

  await sock.sendMessage(from, {
    text: `✅ Pesan berhasil dikirim ke ${count} kontak.`
  }, { quoted: msg });
}

module.exports = handler;

const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const cachePesan = {};
const logDeleted = [];

// Dipanggil sekali waktu koneksi terbentuk
function setupAntiDelete(sock) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const { remoteJid, id } = msg.key;
    cachePesan[remoteJid] = cachePesan[remoteJid] || {};
    cachePesan[remoteJid][id] = {
      from: msg.key.participant || msg.key.remoteJid,
      content: msg.message,
      timestamp: msg.messageTimestamp
    };
  });

  sock.ev.on('messages.update', async updates => {
    for (const { key, update } of updates) {
      if (!update || update.message !== null) continue;

      const { remoteJid, id } = key;
      const pesan = cachePesan?.[remoteJid]?.[id];
      if (!pesan) continue;

      logDeleted.push({ ...pesan, jid: remoteJid });

      await sock.sendMessage(remoteJid, {
        text: `🕵️ Pesan dari @${pesan.from.split('@')[0]} telah dihapus!`,
        mentions: [pesan.from]
      });
    }
  });
}

// Handler command `.p1`
async function handler(sock, msg) {
  const chat = msg.key.remoteJid;
  const logs = logDeleted.filter(l => l.jid === chat);
  if (!logs.length) {
    return sock.sendMessage(chat, { text: '📭 Belum ada pesan yang dihapus.' }, { quoted: msg });
  }

  let teks = '📜 *Log Pesan Terhapus:*\n\n';
  for (const log of logs) {
    const nama = log.from.split('@')[0];
    const jenis = Object.keys(log.content)[0];
    let isi = '';

    switch (jenis) {
      case 'conversation':
        isi = log.content.conversation;
        break;
      case 'extendedTextMessage':
        isi = log.content.extendedTextMessage?.text;
        break;
      default:
        isi = `[${jenis}]`;
    }

    teks += `👤 *${nama}*: ${isi}\n🕐 ${new Date(log.timestamp * 1000).toLocaleString()}\n\n`;
  }

  await sock.sendMessage(chat, { text: teks.trim() }, { quoted: msg });
}

module.exports = { setupAntiDelete, handler };

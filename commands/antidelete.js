const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { adminList } = require('../setting/setting');

const cachePesan = {};
const logDeleted = [];

// Simpan semua pesan yang masuk
function setupAntiDelete(sock) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const { remoteJid, id } = msg.key;
    cachePesan[remoteJid] = cachePesan[remoteJid] || {};
    cachePesan[remoteJid][id] = {
      from: msg.key.participant || msg.key.remoteJid,
      content: msg.message,
      timestamp: msg.messageTimestamp,
      key: msg.key,
    };
  });

  // Cek apakah pesan dihapus
  sock.ev.on('messages.update', async (updates) => {
    for (const { key, update } of updates) {
      if (!update || update.message !== null) continue;

      const { remoteJid, id } = key;
      const pesan = cachePesan?.[remoteJid]?.[id];
      if (!pesan) continue;

      logDeleted.push({ ...pesan, jid: remoteJid });

      // Kirim notifikasi hanya ke adminList
      for (const admin of adminList) {
        try {
          await sock.sendMessage(admin, {
            text: `🕵️ Pesan dari @${pesan.from.split('@')[0]} telah dihapus di chat: ${remoteJid}`,
            mentions: [pesan.from],
          });

          const mediaType = Object.keys(pesan.content)[0];
          if (['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(mediaType)) {
            const mediaBuffer = await downloadMediaMessage(
              { message: pesan.content, key: pesan.key },
              'buffer',
              {},
              { logger: console, reuploadRequest: sock.updateMediaMessage }
            );

            await sock.sendMessage(admin, {
              [mediaType.replace('Message', '')]: mediaBuffer,
              caption: `📎 Media yang dihapus dari @${pesan.from.split('@')[0]}`,
              mentions: [pesan.from],
            });
          }
        } catch (err) {
          console.error('❌ Gagal kirim media terhapus:', err);
        }
      }
    }
  });
}

// Handler `.p1`
async function handler(sock, msg) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const chat = msg.key.remoteJid;

  if (!adminList.includes(sender)) {
    return sock.sendMessage(chat, {
      text: '❌ Fitur ini hanya bisa digunakan oleh admin bot!',
    }, { quoted: msg });
  }

  const logs = logDeleted.filter(l => l.jid === chat);
  if (!logs.length) {
    return sock.sendMessage(chat, {
      text: '📭 Belum ada pesan yang dihapus di sini.',
    }, { quoted: msg });
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

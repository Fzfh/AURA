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

      // Kirim notifikasi hanya ke adminList jika pesan berupa media
      const mediaType = Object.keys(pesan.content)[0];
      if (['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(mediaType)) {
        for (const admin of adminList) {
          try {
            await sock.sendMessage(admin, {
              text: `🕵️ Pesan dari @${pesan.from.split('@')[0]} telah dihapus di chat: ${remoteJid}`,
              mentions: [pesan.from],
            });

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
          } catch (err) {
            console.error('❌ Gagal kirim media terhapus:', err);
          }
        }
      }
    }
  });
}

// Handler `.p1`
async function handler(sock, msg) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const chat = msg.key.remoteJid;

  // Cek apakah pengirim adalah admin grup
  const metadata = await sock.groupMetadata(chat).catch(() => null);
  const isGroupAdmin = metadata?.participants?.find(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!isGroupAdmin) {
    return sock.sendMessage(chat, {
      text: '❌ Fitur ini hanya bisa digunakan oleh admin grup!',
    }, { quoted: msg });
  }

  const logs = logDeleted.filter(l => l.jid === chat && (
    'conversation' in l.content || 'extendedTextMessage' in l.content
  ));

  if (!logs.length) {
    return sock.sendMessage(chat, {
      text: '📭 Belum ada pesan teks yang dihapus di sini.',
    }, { quoted: msg });
  }

  let teks = '📜 *Log Pesan Terhapus:*\n\n';
  for (const log of logs) {
    const tag = '@' + log.from.split('@')[0];
    const isTeks = log.content.conversation || log.content.extendedTextMessage?.text;
    if (!isTeks) continue;

    let isi = log.content.conversation || log.content.extendedTextMessage?.text;
    teks += `👤 ${tag}: ${isi}\n🕐 ${new Date(log.timestamp * 1000).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour12: false
    })}\n\n`;

  if (teks === '📜 *Log Pesan Terhapus:*\n\n') {
    return sock.sendMessage(chat, {
      text: '📭 Tidak ada pesan teks valid yang dihapus.',
    }, { quoted: msg });
  }

  await sock.sendMessage(chat, { text: teks.trim(), mentions: logs.map(l => l.from) }, { quoted: msg });
}

function resetLogDeleted(chatId) {
  const index = logDeleted.findIndex(log => log.jid === chatId);
  if (index !== -1) {
    for (let i = logDeleted.length - 1; i >= 0; i--) {
      if (logDeleted[i].jid === chatId) {
        logDeleted.splice(i, 1);
      }
    }
  }
}
async function resetHandler(sock, msg) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const chat = msg.key.remoteJid;

  // Cek apakah admin grup
  const metadata = await sock.groupMetadata(chat).catch(() => null);
  const isGroupAdmin = metadata?.participants?.find(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!isGroupAdmin) {
    return sock.sendMessage(chat, {
      text: '❌ Fitur ini hanya bisa digunakan oleh admin grup!',
    }, { quoted: msg });
  }

  resetLogDeleted(chat);
  return sock.sendMessage(chat, {
    text: '🧹 Log pesan terhapus berhasil dihapus!',
  }, { quoted: msg });
}


module.exports = {
  setupAntiDelete,
  handler,
  resetLogDeleted,
  // resetLogDeleted: resetHandler
};

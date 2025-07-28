const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const cachePesan = {};
const logDeleted = [];
const adminGroupMap = {}; // cache untuk admin list tiap grup

async function getAdminList(sock, jid) {
  if (adminGroupMap[jid]) return adminGroupMap[jid];
  const metadata = await sock.groupMetadata(jid);
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id);
  adminGroupMap[jid] = admins;
  return admins;
}

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
      key: msg.key
    };
  });

  sock.ev.on('messages.update', async updates => {
    for (const { key, update } of updates) {
      if (!update || update.message !== null) continue;

      const { remoteJid, id } = key;
      const pesan = cachePesan?.[remoteJid]?.[id];
      if (!pesan) continue;

      logDeleted.push({ ...pesan, jid: remoteJid });

      const admins = await getAdminList(sock, remoteJid);
      for (const adminJid of admins) {
        await sock.sendMessage(adminJid, {
          text: `🕵️ Pesan dari @${pesan.from.split('@')[0]} telah dihapus di grup @${remoteJid.split('@')[0]}`,
          mentions: [pesan.from, adminJid]
        });

        try {
          const mediaType = Object.keys(pesan.content)[0];
          if (['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(mediaType)) {
            const mediaBuffer = await downloadMediaMessage(
              { message: pesan.content, key: pesan.key },
              'buffer',
              {},
              { logger: console, reuploadRequest: sock.updateMediaMessage }
            );
            await sock.sendMessage(adminJid, { [mediaType.replace('Message', '')]: mediaBuffer }, { quoted: key });
          }
        } catch (err) {
          console.error('❌ Gagal kirim media terhapus:', err);
        }
      }
    }
  });
}

async function handler(sock, msg) {
  const chat = msg.key.remoteJid;
  const admins = await getAdminList(sock, chat);
  if (!admins.includes(msg.key.participant || msg.key.remoteJid)) {
    return sock.sendMessage(chat, { text: '❌ Fitur ini hanya untuk admin grup!' }, { quoted: msg });
  }

  const logs = logDeleted.filter(l => l.jid === chat);
  if (!logs.length) {
    return sock.sendMessage(chat, { text: '📭 Belum ada pesan yang dihapus.' }, { quoted: msg });
  }

  let teks = '📜 *Log Pesan Terhapus:*

';
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

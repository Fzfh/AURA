const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const cachePesan = {};
const logDeleted = [];

async function setupAntiDelete(conn) {
  conn.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const { remoteJid, id, participant } = msg.key;
    const sender = participant || msg.key.remoteJid;
    if (!remoteJid || !id || msg.key.fromMe) return;

    cachePesan[remoteJid] = cachePesan[remoteJid] || {};
    cachePesan[remoteJid][id] = {
      id,
      from: sender,
      content: msg.message,
      timestamp: msg.messageTimestamp
    };
  });

  conn.ev.on('messages.update', async updates => {
    for (const update of updates) {
      const { key, update: msgUpdate } = update;
      if (!msgUpdate || msgUpdate.message !== null) continue;

      const { remoteJid, id } = key;
      const pesanTerhapus = cachePesan?.[remoteJid]?.[id];
      if (!pesanTerhapus) continue;

      logDeleted.push({
        from: pesanTerhapus.from,
        content: pesanTerhapus.content,
        time: new Date(),
        jid: remoteJid
      });

      await conn.sendMessage(remoteJid, {
        text: `🕵️ Pesan dari @${pesanTerhapus.from.split('@')[0]} telah dihapus!`,
        mentions: [pesanTerhapus.from]
      });
    }
  });
}
async function handler(m, { conn }) {
  const chat = m.chat;
  const logs = logDeleted.filter(l => l.jid === chat);
  if (!logs.length) {
    return await conn.sendMessage(chat, { text: '📭 Belum ada pesan yang dihapus.' }, { quoted: m });
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

    teks += `👤 *${nama}*: ${isi}\n🕐 ${log.time.toLocaleString()}\n\n`;
  }

  await conn.sendMessage(chat, { text: teks.trim() }, { quoted: m });
}

module.exports = {
  handler,           
  setupAntiDelete     
};

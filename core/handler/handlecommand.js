const { createStickerFromText } = require('../stickerHelper');
const commandMap = new Map([
  ['.waifu', require('../../commands/waifu')],
  ['.waifuhen', require('../../commands/waifuhen')],
  ['.sm', require('../../commands/stickerToMedia')],
  ['.tagall', require('../../commands/tagall')],
  ['.kick', require('../../commands/kick')],
  ['.add', require('../../commands/add')],
  ['.open', require('../../commands/openCloseGroup')],
  ['.close', require('../../commands/openCloseGroup')],
  ['.na', require('../../commands/admin').addAdmin],
  ['.una', require('../../commands/admin').removeAdmin],
  ['.qr', require('../../commands/qris')],
  ['.cqr', require('../../commands/createQr')],
  ['.mapqr', require('../../commands/mapqr')],
  ['.linkmap', require('../../commands/linkmap')],
  ['ets', require('../../commands/ekstrakAudio')],
  ['.sendall', require('../../commands/sendAll')],
  ['.d', async (sock, msg, text) => {
    const url = text.trim();
    if (!url.startsWith('http')) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '📎 Kirim link TikTok-nya setelah perintah, contoh:\n.d https://www.tiktok.com/@user/video/...',
      }, { quoted: msg });
    }

    const data = await downloadTiktok(url);
    if (!data) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ Gagal mengunduh video. Coba lagi nanti yaa~',
      }, { quoted: msg });
    }

    await sock.sendMessage(msg.key.remoteJid, {
      video: { url: data.videoUrl }
    }, { quoted: msg });
  }],

  ['.ds', async (sock, msg, text) => {
    const url = text.trim();
    if (!url.startsWith('http')) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '📎 Kirim link TikTok-nya setelah perintah, contoh:\n.ds https://tiktok.com/@...',
      }, { quoted: msg });
    }

    const data = await downloadTiktok(url);
    if (!data) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ Gagal ambil data dari TikTok.',
      }, { quoted: msg });
    }

    await sock.sendMessage(msg.key.remoteJid, {
      video: { url: data.videoUrl }
    }, { quoted: msg });
  }],
  ['.dig', require('../../commands/igDownloader')],
  ['.tl', require('../../commands/translate')],
  ['st', async (sock, msg, text) => {
    const isiTeks = text.replace(/^st\s*/i, '').trim();
    if (!isiTeks) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '📝 Ketik teks setelah perintah *st*, misalnya:\n.st Halo aku ganteng 😎',
      }, { quoted: msg });
    }
  
    const sticker = await createStickerFromText(isiTeks);
    await sock.sendMessage(msg.key.remoteJid, { sticker }, { quoted: msg });
  }],
  ['stickertext', async (sock, msg, text) => {
  const isiTeks = text.replace(/^stickertext\s*/i, '').trim();
  if (!isiTeks) {
    return sock.sendMessage(msg.key.remoteJid, {
      text: '📝 Ketik: stickertext Halo Dunia!',
    }, { quoted: msg });
  }

  const sticker = await createStickerFromText(isiTeks);
  await sock.sendMessage(msg.key.remoteJid, { sticker }, { quoted: msg });
}],
  ['.show', require('../../commands/show')],
  ['s', require('../stickerHelper').createStickerFromMessage],
  ['sticker', require('../stickerHelper').createStickerFromMessage],
]);

async function handleDynamicCommand(sock, msg, text, command, args, from, sender, userId, actualUserId, isGroup) {
  const lowerCommand = command.toLowerCase();

  if (commandMap.has(lowerCommand)) {
    const handler = commandMap.get(lowerCommand);
    if (typeof handler === 'function') {
      return await handler(sock, msg, text, args, from, sender, userId, actualUserId, isGroup);
    }
  }

  return false;
}

module.exports = {
  handleDynamicCommand
};

const axios = require('axios');
const path = require('path');
const { adminList } = require('../setting/setting');

const allowedNSFW = ['ass', 'hentai', 'milf', 'oral', 'paizuri', 'ecchi', 'ero'];

module.exports = async function waifuhen(sock, msg, text) {
  try {
    const remoteJid = msg.key.remoteJid;
    const userId = msg.key.participant || remoteJid;
    const sendTo = remoteJid;

    if (!adminList.includes(userId)) {
      return sock.sendMessage(sendTo, {
        text: '❌ Fitur ini hanya bisa dipakai oleh admin bot saja.',
      }, { quoted: msg });
    }

    const type = text?.toLowerCase()?.trim();
    if (!type) {
      return sock.sendMessage(sendTo, {
        text: `🔞 Gunakan: .waifuhen tag\nTag NSFW tersedia:\n• ${allowedNSFW.join('\n• ')}`,
      }, { quoted: msg });
    }

    if (!allowedNSFW.includes(type)) {
      return sock.sendMessage(sendTo, {
        text: `❌ Tag *${type}* gak tersedia!\n\nPilih salah satu:\n• ${allowedNSFW.join('\n• ')}`,
      }, { quoted: msg });
    }

    const params = new URLSearchParams({
      included_tags: type,
      is_nsfw: 'true',
      gif: 'true',
      limit: '1'
    });

    const res = await axios.get(`https://api.waifu.im/search?${params}`, {
      headers: { 'Accept-Version': 'v5' }
    });

    const img = res.data.images?.[0];
    if (!img?.url) throw new Error('Gagal ambil gambar NSFW');

    const mediaUrl = img.url;
    const ext = path.extname(mediaUrl).toLowerCase();
    const caption = `🔞 ${type.charAt(0).toUpperCase() + type.slice(1)} by AuraBot`;

    if (['.gif', '.mp4', '.webm'].includes(ext)) {
      await sock.sendMessage(sendTo, {
        video: { url: mediaUrl },
        caption,
        gifPlayback: true
      }, { quoted: msg });
    } else {
      await sock.sendMessage(sendTo, {
        image: { url: mediaUrl },
        caption
      }, { quoted: msg });
    }

  } catch (err) {
    console.error('[WAIFUHEN ERROR]', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: '⚠️ Gagal kirim waifuhen. Cek tag atau coba lagi nanti ya.',
    }, { quoted: msg });
  }
};

const { adminList } = require('../setting/setting');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const allowedNSFW = ['ass', 'hentai', 'milf', 'oral', 'paizuri', 'ecchi', 'ero'];

module.exports = async function waifuhen(sock, msg, text) {
  try {
    const sender = msg.key.participant || msg.key.remoteJid; // siapa yang kirim command
    const chatId = msg.key.remoteJid; // tempat command diketik / tempat balasan dikirim
    const isGroup = chatId.endsWith('@g.us');

    // fungsi balas ke chatId dengan quoted message
    const reply = (content) => sock.sendMessage(chatId, content, { quoted: msg });

    // cek admin bot berdasar sender
    if (!adminList.includes(sender)) {
      return reply({ text: '❌ Fitur ini hanya bisa dipakai oleh admin bot saja.' });
    }

    const args = text?.trim().split(/\s+/).slice(1);
    const type = args[0]?.toLowerCase();

    if (!type) {
      return reply({
        text: `🔞 Gunakan: .waifuhen tag\nTag NSFW tersedia:\n• ${allowedNSFW.join('\n• ')}`
      });
    }

    if (!allowedNSFW.includes(type)) {
      return reply({
        text: `❌ Tag *${type}* gak tersedia!\n\nPilih salah satu:\n• ${allowedNSFW.join('\n• ')}`
      });
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

    // Download media ke temp file dulu
    const tempPath = path.join(__dirname, `../temp/${Date.now()}${ext}`);
    const writer = fs.createWriteStream(tempPath);
    const response = await axios.get(mediaUrl, { responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Kalau GIF, convert ke MP4
    if (ext === '.gif') {
      const mp4Path = tempPath.replace('.gif', '.mp4');
      await new Promise((resolve, reject) => {
        const cmd = `ffmpeg -y -i "${tempPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${mp4Path}"`;
        exec(cmd, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const videoBuffer = fs.readFileSync(mp4Path);
      await sock.sendMessage(chatId, {
        video: videoBuffer,
        caption,
        gifPlayback: true
      }, { quoted: msg });

      fs.unlinkSync(tempPath);
      fs.unlinkSync(mp4Path);
    } else {
      const imageBuffer = fs.readFileSync(tempPath);
      await sock.sendMessage(chatId, {
        image: imageBuffer,
        caption
      }, { quoted: msg });

      fs.unlinkSync(tempPath);
    }

  } catch (err) {
    console.error('[WAIFUHEN ERROR]', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: '⚠️ Gagal kirim waifuhen. Cek tag atau coba lagi nanti ya.',
    }, { quoted: msg });
  }
};

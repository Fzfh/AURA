const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); 

const setting = require('../setting/setting'); // langsung dari setting.js
const { adminList } = setting; // ambil adminList langsung

const allowedNSFW = ['ass', 'hentai', 'milf', 'oral', 'paizuri', 'ecchi'];

module.exports = async function waifuhen(sock, msg, text) {
  try {
    const remoteJid = msg.key.remoteJid;
    const isGroup = remoteJid.endsWith('@g.us');
    const userId = isGroup ? msg.key.participant : remoteJid;

    const userJid = userId.includes('@s.whatsapp.net') ? userId : userId.replace(/\D/g, '') + '@s.whatsapp.net';
    const isUserAdmin = adminList.includes(userJid); // cek langsung dari setting

    if (!isUserAdmin) {
      return sock.sendMessage(userId, {
        text: '❌ Fitur ini hanya untuk admin AuraBot yaa 😘',
      }, { quoted: msg });
    }

   const args = text?.trim().split(/\s+/).slice(1);
    if (!args.length) {
      return sock.sendMessage(sender, {
        text: `🔞 Gunakan: .waifuhen tag\nTag NSFW tersedia:\n• ${allowedNSFW.join('\n• ')}`
      }, { quoted: msg });
    }
    const type = args[0]?.toLowerCase();


    if (!allowedNSFW.includes(type)) {
      return sock.sendMessage(sender, {
        text: `❌ Tag *${type}* gak tersedia!\n\nPilih salah satu:\n• ${allowedNSFW.join('\n• ')}`
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

    if (ext === '.gif') {
      const gifPath = path.join(__dirname, `../temp/${Date.now()}.gif`);
      const mp4Path = gifPath.replace('.gif', '.mp4');

      const writer = fs.createWriteStream(gifPath);
      const response = await axios.get(mediaUrl, { responseType: 'stream' });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await new Promise((resolve, reject) => {
        const cmd = `ffmpeg -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${mp4Path}"`;
        exec(cmd, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      await sock.sendMessage(sender, {
        video: { url: mp4Path },
        caption,
        gifPlayback: true
      }, { quoted: msg });

      fs.unlinkSync(gifPath);
      fs.unlinkSync(mp4Path);
    } else {
      await sock.sendMessage(sender, {
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

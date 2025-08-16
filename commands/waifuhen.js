const { adminList } = require('../setting/setting')
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const allowedNSFW = ['ass', 'hentai', 'milf', 'oral', 'paizuri', 'ecchi'];

module.exports = async function waifuhen(sock, msg, text) {
  try {
    const sender = msg.key.remoteJid;
    let userId;

    // Kalau dari grup, ambil participant
    if (msg.key.participant) {
      userId = msg.key.participant;
    } 
    // Kalau dari private, ambil remoteJid
    else if (msg.key.remoteJid.endsWith('@s.whatsapp.net')) {
      userId = msg.key.remoteJid;
    } 
    // Kalau bukan keduanya (misal @g.us, broadcast), langsung stop
    else {
      return; 
    }

    // Debug aman (setelah userId pasti ada)
    console.log('[DEBUG userId]', userId);
    console.log('[DEBUG adminList]', adminList);

    // Cek admin
    if (!adminList.includes(userId)) {
      return sock.sendMessage(sender, {
        text: '❌ Fitur ini hanya bisa dipakai oleh admin bot saja.',
      }, { quoted: msg }).catch(e => console.error('[SEND ERROR]', e));
    }

    // Random NSFW tag
    const type = allowedNSFW[Math.floor(Math.random() * allowedNSFW.length)];
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
      }, { quoted: msg }).catch(e => console.error('[SEND ERROR]', e));

      fs.unlinkSync(gifPath);
      fs.unlinkSync(mp4Path);
    } else {
      await sock.sendMessage(sender, {
        image: { url: mediaUrl },
        caption
      }, { quoted: msg }).catch(e => console.error('[SEND ERROR]', e));
    }

  } catch (err) {
    console.error('[WAIFUHEN ERROR]', err);
    try {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ Gagal kirim waifuhen. Cek tag atau coba lagi nanti ya.',
      }, { quoted: msg });
    } catch (sendErr) {
      console.error('[WAIFUHEN SEND-ERROR]', sendErr);
    }
  }
};

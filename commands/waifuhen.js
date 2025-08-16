const axios = require('axios');
const path = require('path');
const { adminList } = require('../setting/setting');

const allowedNSFW = ['ass','hentai','milf','oral','paizuri','ecchi','ero'];

module.exports = async function waifuhen(sock, msg) {
  try {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const sender = msg.key.remoteJid;

    // normalisasi userId untuk cek admin
    let userId = msg.key.participant || sender;
    if (userId.includes('-')) userId = userId.split('-')[0] + '@s.whatsapp.net';

    if (!adminList.includes(userId)) return; // silent kalau bukan admin

    // pilih tag acak
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
    if (!img?.url) return;

    const mediaUrl = img.url;
    const ext = path.extname(mediaUrl).toLowerCase();
    const caption = `🔞 ${type.charAt(0).toUpperCase()+type.slice(1)} by AuraBot`;

    // quote message di grup berbeda dari pribadi
    const quoted = isGroup ? { key: { remoteJid: sender, participant: msg.key.participant, id: msg.key.id }, message: msg.message } : msg;

    // kirim media
    await sock.sendMessage(sender, 
      ['.gif','.mp4','.webm'].includes(ext) 
        ? { video: { url: mediaUrl }, caption, gifPlayback:true } 
        : { image: { url: mediaUrl }, caption }
    , { quoted });

  } catch (err) {
    console.error('[WAIFUHEN ERROR]', err);
  }
};

const insta = require('instagram-url-direct');

async function downloadInstagram(sock, msg, args) {
  const from = msg.key.remoteJid;
  const url = args[0];

  if (!url || !url.includes("instagram.com")) {
    return sock.sendMessage(from, {
      text: "❌ Link Instagram tidak valid.\nContoh: .ig https://www.instagram.com/reel/xxxxx"
    }, { quoted: msg });
  }

  await sock.sendMessage(from, {
    text: "⏳ Serra lagi download kontennya dari Instagram ya~ tungguin sebentar..."
  }, { quoted: msg });

  try {
    const res = await insta.getInfo(url);

    if (!res || !res.url_list || res.url_list.length === 0) {
      return sock.sendMessage(from, {
        text: "❌ Tidak bisa menemukan media dari link tersebut."
      }, { quoted: msg });
    }

    for (const mediaUrl of res.url_list) {
      if (mediaUrl.includes('.mp4')) {
        await sock.sendMessage(from, { video: { url: mediaUrl } }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { image: { url: mediaUrl } }, { quoted: msg });
      }
    }

  } catch (err) {
    console.error("InstagramDL Error:", err);
    await sock.sendMessage(from, {
      text: "❌ Gagal mengambil media dari Instagram. Coba pakai link publik atau pastikan jaringannya lancar ya!"
    }, { quoted: msg });
  }
}

module.exports = {
  name: 'ig',
  aliases: ['instagram', 'igdl'],
  description: 'Download media dari Instagram (foto, video, reels)',
  category: 'downloader',
  downloadInstagram
};

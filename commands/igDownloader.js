const { instagramdl } = require('@xct007/igdl');

async function downloadInstagram(sock, msg, args) {
  const from = msg.key.remoteJid;
  const url = args[0];

  if (!url || !url.includes("instagram.com")) {
    return sock.sendMessage(from, {
      text: "❌ Link Instagram tidak valid. Contoh: .ig https://www.instagram.com/reel/xxxxx"
    }, { quoted: msg });
  }

  await sock.sendMessage(from, {
    text: "⏳ Serra lagi ambil media-nya dari Instagram yaa~"
  }, { quoted: msg });

  try {
    const res = await instagramdl(url);

    if (!res || res.length === 0) {
      return sock.sendMessage(from, {
        text: "❌ Tidak bisa menemukan media di link tersebut."
      }, { quoted: msg });
    }

    for (const media of res) {
      if (media.type === 'video') {
        await sock.sendMessage(from, {
          video: { url: media.url }
        }, { quoted: msg });
      } else if (media.type === 'image') {
        await sock.sendMessage(from, {
          image: { url: media.url }
        }, { quoted: msg });
      } else {
        await sock.sendMessage(from, {
          text: `📛 Tidak bisa kirim media bertipe: ${media.type}`
        }, { quoted: msg });
      }
    }

  } catch (err) {
    console.error("IGDL Error:", err);
    await sock.sendMessage(from, {
      text: "❌ Gagal mengambil media dari Instagram. Mungkin link-nya private atau error jaringan."
    }, { quoted: msg });
  }
}

module.exports = {
  name: 'ig',
  aliases: ['instagram', 'igdl'],
  description: 'Download media dari Instagram (foto, video, reels)',
  category: 'downloader',
  execute: downloadInstagram
};

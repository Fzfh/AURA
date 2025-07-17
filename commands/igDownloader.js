const axios = require('axios');

module.exports = async function downloadInstagram(sock, msg, text, args) {
  const from = msg.key.remoteJid;
  const url = args[0];

  if (!url || !url.includes("instagram.com")) {
    return sock.sendMessage(from, { text: "❌ Link Instagram tidak valid!" }, { quoted: msg });
  }

  await sock.sendMessage(from, { text: "⏳ Lagi download dari Instagram ya sayang~ Tunggu sebentar 💕" }, { quoted: msg });

  try {
    const response = await axios.post(
      'https://snapinsta.app/action.php',
      new URLSearchParams({
        url: url,
        action: 'post'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://snapinsta.app',
          'Referer': 'https://snapinsta.app/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        }
      }
    );

    const html = response.data;

    const urls = [...html.matchAll(/href="(https:\/\/[^"]+\.cdninstagram[^"]+)"/g)].map(x => x[1]);

    if (urls.length === 0) {
      throw new Error("❌ Gagal menemukan media dari Instagram.");
    }

    // Kirim semua media
    for (const mediaUrl of urls) {
      if (mediaUrl.includes(".mp4")) {
        await sock.sendMessage(from, { video: { url: mediaUrl } }, { quoted: msg });
      } else if (mediaUrl.match(/\.(jpe?g|png|webp)$/)) {
        await sock.sendMessage(from, { image: { url: mediaUrl } }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: `🔗 Media: ${mediaUrl}` }, { quoted: msg });
      }
    }

  } catch (err) {
    console.error("IG Downloader Snapinsta Error:", err);
    await sock.sendMessage(from, { text: "❌ Gagal download media dari SnapInsta. Mungkin link-nya tidak valid atau sedang error." }, { quoted: msg });
  }
};

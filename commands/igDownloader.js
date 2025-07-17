const { instagramdl } = require('@bochilteam/scraper');

module.exports = async function downloadInstagram(sock, msg, text, args) {
  const from = msg.key.remoteJid;
  const url = args[0];

  if (!url || !url.includes("instagram.com")) {
    return sock.sendMessage(from, { text: "❌ Link Instagram tidak valid!" }, { quoted: msg });
  }

  await sock.sendMessage(from, { text: "⏳ Sedang memproses link-nya ya sayang~" }, { quoted: msg });

  try {
    const result = await instagramdl(url);

    if (!result || result.length === 0) {
      throw new Error("Media tidak ditemukan.");
    }

    for (const media of result) {
      if (media.type === 'video') {
        await sock.sendMessage(from, { video: { url: media.url } }, { quoted: msg });
      } else if (media.type === 'image') {
        await sock.sendMessage(from, { image: { url: media.url } }, { quoted: msg });
      }
    }

  } catch (err) {
    console.error("IG Downloader Error:", err.message || err);
    await sock.sendMessage(from, { text: "❌ Gagal download media dari Instagram." }, { quoted: msg });
  }
};

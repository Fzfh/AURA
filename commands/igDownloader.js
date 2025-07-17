const { instagramdl } = require('@bochilteam/scraper');

async function igDownloaderHandler(sock, msg, text, args) {
  const from = msg.key.remoteJid;
  const link = args[0];

  if (!link || !link.includes("instagram.com")) {
    return sock.sendMessage(from, { text: "❌ Link Instagram tidak valid!" }, { quoted: msg });
  }

  await sock.sendMessage(from, { text: "⏳ Sedang memproses..." }, { quoted: msg });

  try {
    const res = await instagramdl(link);
    console.log('📦 Hasil Instagram Download:', res);

    for (const item of res) {
      if (item.type === "image") {
        await sock.sendMessage(from, { image: { url: item.url } }, { quoted: msg });
      } else if (item.type === "video") {
        await sock.sendMessage(from, { video: { url: item.url } }, { quoted: msg });
      }
    }
  } catch (e) {
    console.error("IG Downloader Error:", e);
    await sock.sendMessage(from, { text: "❌ Gagal download dari Instagram. Coba link lain ya~" }, { quoted: msg });
  }
}

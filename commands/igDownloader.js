const { instagramDownload } = require("@mrnima/instagram-downloader");

module.exports = async function igDownloaderHandler(sock, msg, text, args) {
  const from = msg.key.remoteJid;
  const link = args[0];
  if (!link || !link.includes("instagram.com")) {
    await sock.sendMessage(from, { text: "❌ Link Instagram tidak valid!" }, { quoted: msg });
    return;
  }

  await sock.sendMessage(from, { text: "⏳ Sedang memproses..." }, { quoted: msg });

  try {
    const res = await instagramDownload(link);
    console.log('📦 Hasil Instagram Download:', result);
    if (!res.status || !res.result) throw new Error("Download gagal");

    for (const item of res.result) {
      if (item.type === "image") {
        await sock.sendMessage(from, { image: { url: item.link } }, { quoted: msg });
      } else if (item.type === "video") {
        await sock.sendMessage(from, { video: { url: item.link } }, { quoted: msg });
      }
    }
  } catch (e) {
    console.error("IG Downloader Error:", e);
    await sock.sendMessage(from, { text: "❌ Gagal download. Coba lagi nanti ya~" }, { quoted: msg });
  }
};

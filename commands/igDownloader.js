const { instagramDownload } = require("@mrnima/instagram-downloader");
const fs = require("fs");
const path = require("path");
const { tmpdir } = require("os");

// downloadInstagram: return object dengan data dan fungsi send()
async function downloadInstagram(input) {
  try {
    let url = (typeof input === "object" && input.text) ? input.text : String(input).trim();

    if (!/^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_\-]+/.test(url)) {
      throw new Error("URL Instagram tidak valid");
    }

    const result = await instagramDownload(url);
    if (!result || !result.result || result.result.length === 0) {
      throw new Error("Gagal mendapatkan media dari Instagram");
    }

    // ambil video pertama jika ada
    const videoItem = result.result.find(item => item.type === "video");
    if (!videoItem) throw new Error("Tidak ada video, atau cuma foto");

    return {
      videoUrl: videoItem.link,
      all: result,
      async send(sock, msg, from) {
        const filePath = path.join(tmpdir(), `ig-${Date.now()}.mp4`);
        const writer = fs.createWriteStream(filePath);

        const res = await require("axios")({
          url: videoItem.link,
          method: "GET",
          responseType: "stream"
        });
        res.data.pipe(writer);

        await new Promise((r, e) => writer.on("finish", r).on("error", e));

        await sock.sendMessage(from, {
          video: fs.readFileSync(filePath),
          mimetype: "video/mp4",
          caption: "🎬 Video dari Instagram berhasil diunduh!"
        }, { quoted: msg });

        fs.unlinkSync(filePath);
      }
    };
  } catch (err) {
    console.error("IG Downloader Error:", err.message || err);
    return null;
  }
}

module.exports = downloadInstagram;

const downloadInstagram = require('./downloadInstagram');

async function igDownloaderHandler(sock, msg, commandArgs, from) {
  try {
    const url = commandArgs[0];
    if (!url || !url.includes('instagram.com')) {
      await sock.sendMessage(from, { text: '📛 Masukkan URL Instagram yang valid.' }, { quoted: msg });
      return;
    }

    const result = await downloadInstagram(url);

    if (!result || !result.videoUrl) {
      await sock.sendMessage(from, { text: '❌ Gagal mengambil video dari Instagram.' }, { quoted: msg });
      return;
    }

    await sock.sendMessage(from, {
      video: { url: result.videoUrl },
      caption: `✅ Berhasil mengunduh video!\n\n📝 ${result.all.desc || 'Tidak ada deskripsi.'}`
    }, { quoted: msg });

  } catch (e) {
    console.error('IG Downloader Error:', e?.message || e);
    await sock.sendMessage(from, { text: '🚨 Error saat mengunduh dari Instagram. Coba lagi nanti ya!' }, { quoted: msg });
  }
}

module.exports = { igDownloaderHandler };

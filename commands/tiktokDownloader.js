const axios = require('axios');

async function downloadTiktok(url) {
  try {
    const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const data = res.data.data;

    if (!data) throw new Error('Gagal ambil data');

    return {
      isPhoto: Array.isArray(data.images) && data.images.length > 0,
      images: data.images || [],
      videoUrl: data.play || null,
      musicUrl: data.music || null,
      title: data.title,
      author: data.author?.nickname || '',
      cover: data.cover
    };
  } catch (e) {
    console.error('Download Error:', e);
    return null;
  }
}

async function tiktokDownloaderHandler(sock, msg, text) {
  const from = msg.key.remoteJid;
  const lower = text.toLowerCase();
  const command = lower.split(' ')[0];
  const link = text.split(' ')[1];

  if (!['.d', 'd', '.ds', 'ds'].includes(command)) return false;
  if (!link || !link.includes('tiktok.com')) {
    await sock.sendMessage(from, { text: '❌ Link TikTok tidak valid!' }, { quoted: msg });
    return true;
  }

  await sock.sendMessage(from, { text: '⏳ Sedang memproses link TikTok...' }, { quoted: msg });

  try {
    const result = await downloadTiktok(link);

    if (!result) {
      await sock.sendMessage(from, { text: '❌ Gagal mengambil data dari TikTok.' }, { quoted: msg });
      return true;
    }

    if ((command === '.d' || command === 'd') && result.isPhoto && result.images.length > 0) {
      await sock.sendMessage(from, {
        text: '📷 Link kamu adalah *Foto*. ⬇️ Sedang Mengunduh...',
      }, { quoted: msg });

      for (const imageUrl of result.images) {
        await sock.sendMessage(from, {
          image: { url: imageUrl },
        }, { quoted: msg });
      }
      return true;
    }

    if ((command === '.d' || command === 'd') && result.videoUrl) {
      await sock.sendMessage(from, {
        text: '🎞️ Link kamu adalah *Video*. ⬇️ Sedang Mengunduh...',
      }, { quoted: msg });

      await sock.sendMessage(from, {
        video: { url: result.videoUrl },
      }, { quoted: msg });
      return true;
    }

    if ((command === '.ds' || command === 'ds') && result.musicUrl) {
      await sock.sendMessage(from, {
        text: '🎧 Mengunduh sound TikTok...',
      }, { quoted: msg });

      await sock.sendMessage(from, {
        audio: { url: result.musicUrl },
        mimetype: 'audio/mp4'
      }, { quoted: msg });
      return true;
    }

    await sock.sendMessage(from, {
      text: '❌ Tidak ada media yang bisa diunduh dari link ini. Pastikan link-nya benar.',
    }, { quoted: msg });
    return true;

  } catch (e) {
    console.error('❌ Error TikTok:', e);
    await sock.sendMessage(from, {
      text: '⚠️ Terjadi kesalahan saat memproses link TikTok.',
    }, { quoted: msg });
    return true;
  }
}

module.exports = tiktokDownloaderHandler;

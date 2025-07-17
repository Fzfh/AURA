const axios = require('axios');

async function downloadInstagram(url) {
  try {
    const response = await axios.get(`https://instavideodownloader-com.onrender.com/api/video?postUrl=${encodeURIComponent(url)}`);
    const data = response.data;

    if (data.status !== 'success' || !data.data.videoUrl) {
      throw new Error('Video tidak ditemukan');
    }

    return {
      videoUrl: data.data.videoUrl,
      thumbnail: data.data.thumbnail,
      desc: data.data.description || '',
    };
  } catch (err) {
    console.error('IG Downloader Error:', err.message || err);
    return null;
  }
}

async function igDownloaderHandler(sock, msg, text) {
  const from = msg.key.remoteJid;
  const command = text.split(' ')[0];
  const link = text.split(' ')[1];

  if (!['.dig', 'dig'].includes(command)) return false;
  if (!link || !link.includes('instagram.com')) {
    await sock.sendMessage(from, { text: '❌ Link Instagram tidak valid!' }, { quoted: msg });
    return true;
  }

  await sock.sendMessage(from, { text: '⏳ Sedang memproses link Instagram...' }, { quoted: msg });

  const result = await downloadInstagram(link);

  if (!result || !result.videoUrl) {
    await sock.sendMessage(from, { text: '❌ Gagal mengunduh video dari Instagram.' }, { quoted: msg });
    return true;
  }

  await sock.sendMessage(from, {
    video: { url: result.videoUrl }
  }, { quoted: msg });

  return true;
}

module.exports = igDownloaderHandler;

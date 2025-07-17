const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

// Fungsi unduh video ke lokal (pakai stream)
async function downloadVideoToLocal(videoUrl) {
  const fileName = `ig-${Date.now()}.mp4`;
  const filePath = path.join(tmpdir(), fileName);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url: videoUrl,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

async function downloadInstagram(url) {
  try {
    // Handle kalau url dikirim sebagai object (misalnya dari msg.message.conversation)
    if (typeof url === 'object' && typeof url.text === 'string') {
      url = url.text;
    }

    const trimmedUrl = String(url).trim();

    // Validasi basic
    if (!/^https?:\/\/(www\.)?instagram\.com\/(reel|p|tv)\/[a-zA-Z0-9_\-]+/.test(trimmedUrl)) {
      throw new Error('URL Instagram tidak valid');
    }

    const response = await axios.get(`https://instavideodownloader-com.onrender.com/api/video?postUrl=${encodeURIComponent(trimmedUrl)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
      }
    });

    const data = response.data;

    if (data.status !== 'success' || !data.data.videoUrl) {
      throw new Error(data.message || 'Video tidak ditemukan');
    }

    return {
      videoUrl: data.data.videoUrl,
      musicUrl: null,
      all: data.data,
      async send(sock, msg, from) {
        try {
          const filePath = await downloadVideoToLocal(data.data.videoUrl);
          await sock.sendMessage(from, {
            video: fs.readFileSync(filePath),
            mimetype: 'video/mp4',
            caption: '🎬 Video dari Instagram berhasil diunduh!'
          }, { quoted: msg });

          // Hapus setelah dikirim
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Gagal mengirim video IG:', e.message);
          await sock.sendMessage(from, { text: '❌ Gagal mengirim video.' }, { quoted: msg });
        }
      }
    };
  } catch (err) {
    console.error('IG Downloader Error:', err.response?.data || err.message || err);
    return null;
  }
}

module.exports = downloadInstagram;

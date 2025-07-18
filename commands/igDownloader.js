const axios = require('axios');

async function downloadInstagram(url) {
  try {
    const resVideo = await axios.get(`https://instavideodownloader-com.onrender.com/api/video?postUrl=${encodeURIComponent(url)}`);
    const resImage = await axios.get(`https://instavideodownloader-com.onrender.com/api/image?postUrl=${encodeURIComponent(url)}`);

    const videoData = resVideo.data;
    const imageData = resImage.data;

    if (videoData.status !== 'success' && imageData.status !== 'success') {
      throw new Error('Media tidak ditemukan');
    }

    return {
      videoUrl: videoData?.data?.videoUrl || null,
      imageUrl: imageData?.data?.imageUrl || null,
      thumbnail: videoData?.data?.thumbnail || imageData?.data?.thumbnail || null,
      desc: videoData?.data?.description || imageData?.data?.description || ''
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

  if (!result || (!result.videoUrl && !result.imageUrl)) {
    await sock.sendMessage(from, { text: '❌ Tidak dapat mengunduh media dari Instagram.' }, { quoted: msg });
    return true;
  }

  if (result.videoUrl) {
    await sock.sendMessage(from, {
      text: '🎥 Mengirim video Instagram...',
    }, { quoted: msg });
    await sock.sendMessage(from, {
      video: { url: result.videoUrl },
    }, { quoted: msg });
  }

  if (result.imageUrl) {
    await sock.sendMessage(from, {
      text: '📸 Mengirim foto Instagram...',
    }, { quoted: msg });
    await sock.sendMessage(from, {
      image: { url: result.imageUrl },
    }, { quoted: msg });
  }

  return true;
}

module.exports = igDownloaderHandler;

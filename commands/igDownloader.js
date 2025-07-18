const axios = require('axios');
const { getMedia } = require('instagram-scraper-api');

module.exports = async function downloadInstagram(sock, msg, text) {
  const from = msg.key.remoteJid;
  const command = text.split(' ')[0];
  const link = text.split(' ')[1];

  if (!['.dig', 'dig'].includes(command)) return false;
  if (!link || !link.includes('instagram.com')) {
    await sock.sendMessage(from, { text: '❌ Link Instagram tidak valid!' }, { quoted: msg });
    return true;
  }

  await sock.sendMessage(from, { text: '⏳ Sedang memproses link Instagram...' }, { quoted: msg });

  let result = null;

  try {
    const resVideo = await axios.get(`https://instavideodownloader-com.onrender.com/api/video?postUrl=${encodeURIComponent(link)}`);
    const resImage = await axios.get(`https://instavideodownloader-com.onrender.com/api/image?postUrl=${encodeURIComponent(link)}`);

    const videoData = resVideo.data;
    const imageData = resImage.data;

    if (videoData.status !== 'success' && imageData.status !== 'success') throw new Error('API utama gagal');

    result = {
      videoUrl: videoData?.data?.videoUrl || null,
      imageUrl: imageData?.data?.imageUrl || null,
      thumbnail: videoData?.data?.thumbnail || imageData?.data?.thumbnail || null,
      desc: videoData?.data?.description || imageData?.data?.description || ''
    };
  } catch (err) {
    console.warn('⚠️ Fallback: API utama gagal:', err.message);

    try {
      const media = await getMedia(link);
      if (media && media.length > 0) {
        const item = media[0];
        result = {
          videoUrl: item.type === 'video' ? item.url : null,
          imageUrl: item.type === 'image' ? item.url : null,
          thumbnail: null,
          desc: item.caption || ''
        };
      }
    } catch (fallbackErr) {
      console.error('❌ Fallback gagal:', fallbackErr.message);
    }
  }

  if (!result || (!result.videoUrl && !result.imageUrl)) {
    await sock.sendMessage(from, { text: '❌ Tidak dapat mengunduh media dari Instagram.' }, { quoted: msg });
    return true;
  }

  if (result.videoUrl) {
    await sock.sendMessage(from, { text: '🎥 Mengirim video Instagram...' }, { quoted: msg });
    await sock.sendMessage(from, { video: { url: result.videoUrl } }, { quoted: msg });
  }

  if (result.imageUrl) {
    await sock.sendMessage(from, { text: '📸 Mengirim foto Instagram...' }, { quoted: msg });
    await sock.sendMessage(from, { image: { url: result.imageUrl } }, { quoted: msg });
  }

  return true;
};

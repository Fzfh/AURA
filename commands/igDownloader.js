const axios = require('axios');

async function downloadInstagram(url) {
  try {
    const resVideo = await axios.get(`https://instavideodownloader-com.onrender.com/api/video?postUrl=${encodeURIComponent(url)}`);
    const resImage = await axios.get(`https://instavideodownloader-com.onrender.com/api/image?postUrl=${encodeURIComponent(url)}`);

    const videoData = resVideo.data;
    const imageData = resImage.data;

    if (
      (videoData.status !== 'success' || !videoData?.data?.videoUrl) &&
      (imageData.status !== 'success' || !imageData?.data?.imageUrl)
    ) {
      throw new Error('API utama gagal');
    }

    return {
      videoUrl: videoData?.data?.videoUrl || null,
      imageUrl: imageData?.data?.imageUrl || imageData?.data?.thumbnail || null,
      desc: videoData?.data?.description || imageData?.data?.description || ''
    };
  } catch (err) {
    console.warn('[Fallback] API utama gagal:', err.message);

    try {
      const fallback = await axios.get(`https://latam-api.vercel.app/api/instagram?url=${encodeURIComponent(url)}`);
      const data = fallback.data;

      if (!data || data?.error || (!data?.video && !data?.image)) {
        throw new Error('Fallback gagal');
      }

      return {
        videoUrl: data.video || null,
        imageUrl: data.image || null,
        desc: data.caption || ''
      };
    } catch (err2) {
      console.error('[IG Downloader Fallback Error]:', err2.message || err2);
      return null;
    }
  }
}

module.exports = downloadInstagram;
